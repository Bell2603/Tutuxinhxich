-- Phân quyền: RLS + quyền theo cột. App chạy bằng publishable/anon key, mọi kiểm tra quyền nằm ở đây.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

-- Supabase mặc định cấp toàn quyền bảng cho anon/authenticated → thu hồi, cấp lại tối thiểu.
revoke all on table public.products, public.profiles, public.orders, public.order_items, public.order_events
  from anon, authenticated;
revoke all on sequence public.order_code_seq from anon, authenticated;

-- Sản phẩm: ai cũng xem được sản phẩm đang hiển thị; admin xem tất cả và sửa được các cột nội dung.
-- Không có policy insert/delete: không ai (ngoài migration/service role) tạo hoặc xóa sản phẩm.
grant select on public.products to anon, authenticated;
grant update (
  name, short_description, description, material, fabric, colors, size, care_instructions,
  price, compare_at_price, stock, image_url, gallery, badge, is_visible, is_featured, sort_order
) on public.products to authenticated;

create policy products_select_anon on public.products
  for select to anon
  using (is_visible);

create policy products_select_authenticated on public.products
  for select to authenticated
  using (is_visible or (select public.is_admin()));

create policy products_update_admin on public.products
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Hồ sơ: chỉ đọc/sửa của mình (không sửa được role); admin đọc tất cả.
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Đơn hàng: chỉ đọc trực tiếp; tạo/đổi trạng thái qua RPC (security definer).
grant select on public.orders, public.order_items, public.order_events to authenticated;

create policy orders_select_own_or_admin on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy order_items_select_own_or_admin on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

create policy order_events_select_own_or_admin on public.order_events
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

-- Hàm: chỉ cấp quyền gọi cho những hàm cần thiết.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.enforce_product_limit() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
