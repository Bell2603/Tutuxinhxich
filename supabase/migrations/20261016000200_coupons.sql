-- Mã giảm giá: tính và trừ lượt dùng trong database khi đặt hàng; hủy đơn → trả lại lượt.
-- Hằng số/công thức phải khớp src/features/coupons/domain.ts (integration test kiểm tra).

create type public.coupon_type as enum ('percent', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{3,20}$'),
  description text not null default '' check (char_length(description) <= 200),
  discount_type public.coupon_type not null,
  discount_value integer not null check (discount_value > 0 and discount_value <= 10000000),
  max_discount integer check (max_discount is null or (max_discount > 0 and max_discount <= 10000000)),
  min_subtotal integer not null default 0 check (min_subtotal between 0 and 100000000),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  per_customer_limit integer not null default 1 check (per_customer_limit between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_percent_range check (discount_type <> 'percent' or discount_value between 1 and 90),
  constraint coupons_valid_period check (ends_at is null or starts_at is null or ends_at > starts_at)
);

comment on table public.coupons is 'Mã giảm giá. Quản lý tại /admin/ma-giam-gia.';

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

create table public.coupon_redemptions (
  id bigint generated always as identity primary key,
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid not null unique references public.orders (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index coupon_redemptions_coupon_user_idx on public.coupon_redemptions (coupon_id, user_id);

alter table public.orders add column coupon_code text;
alter table public.orders add column discount integer not null default 0 check (discount >= 0);
alter table public.orders drop constraint orders_total_matches;
alter table public.orders add constraint orders_total_matches check (total = subtotal + shipping_fee - discount);
alter table public.orders add constraint orders_discount_le_subtotal check (discount <= subtotal);

-- Số tiền giảm: % làm tròn xuống tới 1.000₫ và không vượt mức tối đa; tiền cố định không vượt tạm tính.
create function public.coupon_discount_amount(
  p_type public.coupon_type,
  p_value integer,
  p_max integer,
  p_subtotal integer
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select greatest(0, least(
    p_subtotal,
    case p_type
      when 'percent' then least(floor(p_subtotal::numeric * p_value / 100 / 1000)::integer * 1000, coalesce(p_max, 2147483647))
      else p_value
    end
  ));
$$;

-- Kiểm tra mã cho người đang đăng nhập; ném lỗi nghiệp vụ nếu không dùng được. Trả về coupon (đã khóa nếu p_lock).
create function public.check_coupon(p_code text, p_subtotal integer, p_user uuid, p_lock boolean)
returns public.coupons
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coupon public.coupons;
  v_used integer;
begin
  if p_lock then
    select * into v_coupon from public.coupons where code = upper(btrim(coalesce(p_code, ''))) for update;
  else
    select * into v_coupon from public.coupons where code = upper(btrim(coalesce(p_code, '')));
  end if;

  if not found or not v_coupon.is_active then
    raise exception 'COUPON_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    raise exception 'COUPON_NOT_STARTED' using errcode = 'P0001';
  end if;
  if v_coupon.ends_at is not null and now() >= v_coupon.ends_at then
    raise exception 'COUPON_EXPIRED' using errcode = 'P0001';
  end if;
  if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
    raise exception 'COUPON_USED_UP' using errcode = 'P0001';
  end if;
  select count(*) into v_used from public.coupon_redemptions r where r.coupon_id = v_coupon.id and r.user_id = p_user;
  if v_used >= v_coupon.per_customer_limit then
    raise exception 'COUPON_ALREADY_USED' using errcode = 'P0001';
  end if;
  if p_subtotal < v_coupon.min_subtotal then
    raise exception 'COUPON_MIN_SUBTOTAL'
      using errcode = 'P0001', detail = json_build_object('min_subtotal', v_coupon.min_subtotal)::text;
  end if;
  return v_coupon;
end;
$$;

-- Xem trước mã ở trang thanh toán (giá trị thật tính lại trong place_order).
create function public.preview_coupon(p_code text, p_subtotal integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_coupon public.coupons;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  v_coupon := public.check_coupon(p_code, greatest(coalesce(p_subtotal, 0), 0), auth.uid(), false);
  return jsonb_build_object(
    'code', v_coupon.code,
    'description', v_coupon.description,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'max_discount', v_coupon.max_discount,
    'min_subtotal', v_coupon.min_subtotal,
    'discount', public.coupon_discount_amount(v_coupon.discount_type, v_coupon.discount_value, v_coupon.max_discount, p_subtotal)
  );
end;
$$;

-- Trả lượt dùng mã khi đơn bị hủy.
create function public.release_coupon(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coupon_id uuid;
begin
  delete from public.coupon_redemptions where order_id = p_order_id returning coupon_id into v_coupon_id;
  if v_coupon_id is not null then
    update public.coupons set used_count = greatest(used_count - 1, 0) where id = v_coupon_id;
  end if;
end;
$$;

-- place_order: thêm tham số mã giảm giá (đổi chữ ký → xóa bản cũ).
drop function public.place_order(jsonb, jsonb, public.payment_method, uuid);

create function public.place_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method public.payment_method,
  p_client_request_id uuid,
  p_coupon_code text default null
)
returns table (order_id uuid, order_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_code text;
  v_line record;
  v_product record;
  v_coupon public.coupons;
  v_has_coupon boolean := nullif(btrim(coalesce(p_coupon_code, '')), '') is not null;
  v_subtotal integer := 0;
  v_count integer := 0;
  v_fee integer;
  v_discount integer := 0;
  v_name text := btrim(coalesce(p_shipping ->> 'recipient_name', ''));
  v_phone text := btrim(coalesce(p_shipping ->> 'phone', ''));
  v_address text := btrim(coalesce(p_shipping ->> 'address', ''));
  v_ward text := btrim(coalesce(p_shipping ->> 'ward', ''));
  v_province text := btrim(coalesce(p_shipping ->> 'province', ''));
  v_note text := btrim(coalesce(p_shipping ->> 'note', ''));
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  if p_client_request_id is null then
    raise exception 'INVALID_REQUEST' using errcode = 'P0001';
  end if;

  select o.id, o.code into v_order_id, v_code
  from public.orders o
  where o.user_id = v_user and o.client_request_id = p_client_request_id;
  if found then
    return query select v_order_id, v_code;
    return;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;

  if char_length(v_name) not between 2 and 100
    or v_phone !~ '^0[35789][0-9]{8}$'
    or char_length(v_address) not between 5 and 255
    or char_length(v_ward) not between 2 and 100
    or char_length(v_province) not between 2 and 100
    or char_length(v_note) > 500 then
    raise exception 'INVALID_SHIPPING' using errcode = 'P0001';
  end if;

  for v_line in
    select (e ->> 'product_id')::uuid as product_id, sum((e ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
    order by 1
  loop
    select p.sku, p.name, p.price, p.stock, p.is_visible into v_product
    from public.products p
    where p.id = v_line.product_id
    for update;

    if not found or not v_product.is_visible then
      raise exception 'PRODUCT_UNAVAILABLE'
        using errcode = 'P0001', detail = json_build_object('product_id', v_line.product_id, 'name', v_product.name)::text;
    end if;
    if v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 10 then
      raise exception 'INVALID_QUANTITY'
        using errcode = 'P0001', detail = json_build_object('sku', v_product.sku, 'name', v_product.name)::text;
    end if;
    if v_product.stock < v_line.quantity then
      raise exception 'INSUFFICIENT_STOCK'
        using errcode = 'P0001',
          detail = json_build_object('sku', v_product.sku, 'name', v_product.name, 'available', v_product.stock)::text;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_line.quantity;
    v_count := v_count + v_line.quantity;
  end loop;

  -- Mã giảm giá: khóa dòng coupon để không vượt giới hạn lượt khi đặt đồng thời.
  if v_has_coupon then
    v_coupon := public.check_coupon(p_coupon_code, v_subtotal, v_user, true);
    v_discount := public.coupon_discount_amount(v_coupon.discount_type, v_coupon.discount_value, v_coupon.max_discount, v_subtotal);
  end if;

  -- Phí ship tính theo tạm tính trước giảm giá.
  v_fee := public.shipping_fee_for(v_subtotal);
  v_code := 'TT' || to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYMMDD')
    || lpad(nextval('public.order_code_seq')::text, 4, '0');

  begin
    insert into public.orders (
      code, user_id, client_request_id, status, payment_method,
      recipient_name, phone, address, ward, province, note,
      subtotal, shipping_fee, discount, coupon_code, total, item_count
    ) values (
      v_code, v_user, p_client_request_id, 'pending', p_payment_method,
      v_name, v_phone, v_address, v_ward, v_province, v_note,
      v_subtotal, v_fee, v_discount, case when v_has_coupon then v_coupon.code end,
      v_subtotal + v_fee - v_discount, v_count
    )
    returning id into v_order_id;
  exception when unique_violation then
    select o.id, o.code into v_order_id, v_code
    from public.orders o
    where o.user_id = v_user and o.client_request_id = p_client_request_id;
    return query select v_order_id, v_code;
    return;
  end;

  with lines as (
    select (e ->> 'product_id')::uuid as product_id, sum((e ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
  )
  insert into public.order_items (order_id, product_id, sku, product_name, image_url, unit_price, quantity, line_total)
  select v_order_id, p.id, p.sku, p.name, p.image_url, p.price, l.quantity, p.price * l.quantity
  from lines l
  join public.products p on p.id = l.product_id;

  with lines as (
    select (e ->> 'product_id')::uuid as product_id, sum((e ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
  )
  update public.products p
  set stock = p.stock - l.quantity
  from lines l
  where p.id = l.product_id;

  if v_has_coupon then
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    insert into public.coupon_redemptions (coupon_id, user_id, order_id) values (v_coupon.id, v_user, v_order_id);
  end if;

  insert into public.order_events (order_id, status, note, created_by)
  values (v_order_id, 'pending', 'Đơn hàng đã được tạo', v_user);

  return query select v_order_id, v_code;
end;
$$;

-- Hủy đơn (admin hoặc khách): hoàn kho + trả lượt dùng mã.
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_note text default ''
)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.order_status;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  select o.status into v_current from public.orders o where o.id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not public.can_transition_order(v_current, p_status) then
    raise exception 'INVALID_TRANSITION'
      using errcode = 'P0001', detail = json_build_object('from', v_current, 'to', p_status)::text;
  end if;

  update public.orders set status = p_status where id = p_order_id;

  if p_status = 'cancelled' then
    perform public.restock_order(p_order_id);
    perform public.release_coupon(p_order_id);
  end if;

  insert into public.order_events (order_id, status, note, created_by)
  values (p_order_id, p_status, left(btrim(coalesce(p_note, '')), 500), auth.uid());

  return p_status;
end;
$$;

create or replace function public.cancel_my_order(p_order_id uuid)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_current public.order_status;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select o.status into v_current
  from public.orders o
  where o.id = p_order_id and o.user_id = v_user
  for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_current <> 'pending' then
    raise exception 'INVALID_TRANSITION'
      using errcode = 'P0001', detail = json_build_object('from', v_current, 'to', 'cancelled')::text;
  end if;

  update public.orders set status = 'cancelled' where id = p_order_id;
  perform public.restock_order(p_order_id);
  perform public.release_coupon(p_order_id);

  insert into public.order_events (order_id, status, note, created_by)
  values (p_order_id, 'cancelled', 'Khách hàng hủy đơn', v_user);

  return 'cancelled';
end;
$$;

-- Phân quyền: chỉ admin xem/quản lý mã; khách chỉ kiểm tra qua preview_coupon.
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
revoke all on table public.coupons, public.coupon_redemptions from anon, authenticated;
grant select, insert, delete on public.coupons to authenticated;
grant update (description, is_active, ends_at, usage_limit, per_customer_limit, min_subtotal, max_discount) on public.coupons to authenticated;
grant select on public.coupon_redemptions to authenticated;

create policy coupons_admin_select on public.coupons for select to authenticated using ((select public.is_admin()));
create policy coupons_admin_insert on public.coupons for insert to authenticated with check ((select public.is_admin()));
create policy coupons_admin_update on public.coupons for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
-- Chỉ xóa được mã chưa dùng lần nào (đã dùng thì tắt is_active).
create policy coupons_admin_delete on public.coupons for delete to authenticated
  using ((select public.is_admin()) and used_count = 0);
create policy coupon_redemptions_admin_select on public.coupon_redemptions for select to authenticated
  using ((select public.is_admin()));

revoke all on function public.coupon_discount_amount(public.coupon_type, integer, integer, integer) from public;
grant execute on function public.coupon_discount_amount(public.coupon_type, integer, integer, integer) to anon, authenticated;
revoke all on function public.check_coupon(text, integer, uuid, boolean) from public, anon, authenticated;
revoke all on function public.release_coupon(uuid) from public, anon, authenticated;
revoke all on function public.preview_coupon(text, integer) from public, anon;
grant execute on function public.preview_coupon(text, integer) to authenticated;
revoke all on function public.place_order(jsonb, jsonb, public.payment_method, uuid, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, public.payment_method, uuid, text) to authenticated;
