-- Đánh giá thật: chỉ khách có đơn ĐÃ GIAO chứa sản phẩm mới viết được (kiểm tra trong DB).

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  content text not null check (char_length(btrim(content)) between 10 and 1000),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 60),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_one_per_customer unique (product_id, user_id)
);

comment on table public.product_reviews is 'Đánh giá của khách đã nhận hàng. Admin ẩn/hiện tại /admin/danh-gia.';

create index product_reviews_product_idx on public.product_reviews (product_id, created_at desc);
create index product_reviews_user_idx on public.product_reviews (user_id);

create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

-- Tên hiển thị gọn, giữ riêng tư: "Nguyễn Thị Xinh" → "Xinh N."
create function public.review_display_name(p_full_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(btrim(p_full_name), '') = '' then 'Khách hàng'
    when array_length(regexp_split_to_array(btrim(p_full_name), '\s+'), 1) = 1 then left(btrim(p_full_name), 40)
    else left(
      (regexp_split_to_array(btrim(p_full_name), '\s+'))[array_length(regexp_split_to_array(btrim(p_full_name), '\s+'), 1)]
      || ' ' || upper(left(btrim(p_full_name), 1)) || '.',
      40
    )
  end;
$$;

create function public.has_delivered_product(p_user uuid, p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.user_id = p_user and o.status = 'delivered' and oi.product_id = p_product_id
  );
$$;

-- Viết hoặc sửa đánh giá của chính mình.
create function public.submit_review(p_product_id uuid, p_rating integer, p_content text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_content text := btrim(coalesce(p_content, ''));
  v_name text;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'INVALID_REVIEW' using errcode = 'P0001', detail = '{"field":"rating"}';
  end if;
  if char_length(v_content) not between 10 and 1000 then
    raise exception 'INVALID_REVIEW' using errcode = 'P0001', detail = '{"field":"content"}';
  end if;
  if not public.has_delivered_product(v_user, p_product_id) then
    raise exception 'REVIEW_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select public.review_display_name(p.full_name) into v_name from public.profiles p where p.id = v_user;

  insert into public.product_reviews (product_id, user_id, rating, content, author_name)
  values (p_product_id, v_user, p_rating, v_content, coalesce(v_name, 'Khách hàng'))
  on conflict (product_id, user_id) do update
    set rating = excluded.rating, content = excluded.content, author_name = excluded.author_name
  returning id into v_id;

  return v_id;
end;
$$;

-- Trạng thái của người đang đăng nhập với một sản phẩm: được viết đánh giá chưa, đã viết gì.
create function public.review_status_for_me(p_product_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'eligible', public.has_delivered_product((select auth.uid()), p_product_id),
    'review', (
      select jsonb_build_object('id', r.id, 'rating', r.rating, 'content', r.content, 'is_visible', r.is_visible, 'created_at', r.created_at)
      from public.product_reviews r
      where r.product_id = p_product_id and r.user_id = (select auth.uid())
    )
  );
$$;

-- Điểm trung bình theo sản phẩm (chỉ đánh giá đang hiển thị; RLS áp dụng theo người xem).
create view public.product_review_stats
with (security_invoker = true)
as
select
  product_id,
  count(*)::integer as review_count,
  round(avg(rating)::numeric, 1)::double precision as average_rating
from public.product_reviews
where is_visible
group by product_id;

alter table public.product_reviews enable row level security;
revoke all on table public.product_reviews from anon, authenticated;
-- Không cho đọc user_id (không lộ ai đã mua gì); đánh giá của chính mình lấy qua RPC review_status_for_me.
grant select (id, product_id, rating, content, author_name, is_visible, created_at, updated_at)
  on public.product_reviews to anon, authenticated;
grant update (is_visible) on public.product_reviews to authenticated;
grant delete on public.product_reviews to authenticated;
grant select on public.product_review_stats to anon, authenticated;

create policy product_reviews_select_anon on public.product_reviews
  for select to anon
  using (is_visible);

create policy product_reviews_select_authenticated on public.product_reviews
  for select to authenticated
  using (is_visible or user_id = (select auth.uid()) or (select public.is_admin()));

-- Chỉ admin ẩn/hiện (quyền cột chỉ cho is_visible).
create policy product_reviews_update_admin on public.product_reviews
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Khách xóa đánh giá của chính mình; admin xóa được mọi đánh giá.
create policy product_reviews_delete_own_or_admin on public.product_reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke all on function public.review_display_name(text) from public;
grant execute on function public.review_display_name(text) to anon, authenticated;
-- Chỉ dùng nội bộ (nhận user id tùy ý) → không cấp quyền gọi trực tiếp.
revoke all on function public.has_delivered_product(uuid, uuid) from public, anon, authenticated;
revoke all on function public.review_status_for_me(uuid) from public, anon;
grant execute on function public.review_status_for_me(uuid) to authenticated;
revoke all on function public.submit_review(uuid, integer, text) from public, anon;
grant execute on function public.submit_review(uuid, integer, text) to authenticated;
