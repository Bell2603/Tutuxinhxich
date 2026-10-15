-- Tu Tu Xình Xịch — schema cốt lõi: sản phẩm (đúng 6 SKU), hồ sơ người dùng, đơn hàng.

create type public.product_badge as enum ('new', 'best_seller', 'limited');
create type public.fabric_type as enum ('satin', 'len', 'voan', 'cotton');
create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled');
create type public.payment_method as enum ('cod', 'bank_transfer_mock');

-- Dùng chung cho mọi bảng có cột updated_at.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Sản phẩm
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique check (sku ~ '^TTXX-[0-9]{3}$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  short_description text not null default '' check (char_length(short_description) <= 200),
  description text not null default '' check (char_length(description) <= 4000),
  material text not null default '' check (char_length(material) <= 200),
  fabric public.fabric_type not null,
  -- [{ "name": "Hồng phấn", "hex": "#FFB3D1", "family": "hong" }, ...]
  colors jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array' and jsonb_array_length(colors) <= 8),
  size text not null default '' check (char_length(size) <= 80),
  care_instructions text not null default '' check (char_length(care_instructions) <= 1000),
  price integer not null check (price between 1000 and 100000000),
  compare_at_price integer check (
    compare_at_price is null or (compare_at_price > price and compare_at_price <= 100000000)
  ),
  stock integer not null default 0 check (stock between 0 and 100000),
  image_url text not null default '' check (char_length(image_url) <= 1000),
  gallery text[] not null default '{}' check (cardinality(gallery) <= 8),
  badge public.product_badge,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  sort_order smallint not null default 0 check (sort_order between 0 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Đúng 6 mã sản phẩm khăn quàng cổ. Chỉnh sửa qua trang /admin/san-pham.';
comment on column public.products.price is 'Giá bán (VND, số nguyên).';
comment on column public.products.compare_at_price is 'Giá gốc (VND) — để trống nếu không giảm giá; phải lớn hơn giá bán.';
comment on column public.products.stock is 'Số lượng tồn kho.';
comment on column public.products.image_url is 'Ảnh chính: đường dẫn /products/... trong thư mục public hoặc URL Supabase Storage (bucket product-images).';
comment on column public.products.gallery is 'Bộ ảnh chi tiết (tối đa 8).';

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Thương hiệu chỉ bán đúng 6 mã: chặn tạo sản phẩm thứ 7 ở tầng database.
create function public.enforce_product_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('public.products.limit'));
  if (select count(*) from public.products) >= 6 then
    raise exception 'PRODUCT_LIMIT_REACHED'
      using errcode = 'P0001', hint = 'Tu Tu Xình Xịch chỉ bán đúng 6 mã sản phẩm.';
  end if;
  return new;
end;
$$;

create trigger products_enforce_limit
  before insert on public.products
  for each row execute function public.enforce_product_limit();

-- ---------------------------------------------------------------------------
-- Hồ sơ người dùng (1-1 với auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  phone text not null default '' check (char_length(phone) <= 20),
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(left(btrim(new.raw_user_meta_data ->> 'full_name'), 100), ''),
    coalesce(left(btrim(new.raw_user_meta_data ->> 'phone'), 20), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Đơn hàng
-- ---------------------------------------------------------------------------
create sequence public.order_code_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  client_request_id uuid not null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  recipient_name text not null check (char_length(recipient_name) between 2 and 100),
  phone text not null check (phone ~ '^0[35789][0-9]{8}$'),
  address text not null check (char_length(address) between 5 and 255),
  ward text not null check (char_length(ward) between 2 and 100),
  province text not null check (char_length(province) between 2 and 100),
  note text not null default '' check (char_length(note) <= 500),
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  total integer not null,
  item_count integer not null check (item_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_matches check (total = subtotal + shipping_fee),
  constraint orders_request_unique unique (user_id, client_request_id)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  sku text not null,
  product_name text not null,
  image_url text not null default '',
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 10),
  line_total integer not null,
  constraint order_items_line_total check (line_total = unit_price * quantity)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Lịch sử trạng thái (timeline) của đơn.
create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text not null default '' check (char_length(note) <= 500),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);
create index order_events_created_by_idx on public.order_events (created_by);
