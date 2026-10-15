-- Nghiệp vụ đơn hàng chạy trong database để giá, tồn kho và trạng thái luôn nhất quán.
-- Quy ước lỗi: SQLSTATE P0001, message = mã máy (VD: INSUFFICIENT_STOCK), detail = JSON ngữ cảnh.
-- Hằng số phải khớp với src/features/cart/domain.ts (có integration test kiểm tra).

create function public.shipping_fee_for(p_subtotal integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_subtotal <= 0 or p_subtotal >= 500000 then 0 else 30000 end;
$$;

create function public.can_transition_order(p_from public.order_status, p_to public.order_status)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_from
    when 'pending' then p_to in ('confirmed', 'cancelled')
    when 'confirmed' then p_to in ('shipping', 'cancelled')
    when 'shipping' then p_to in ('delivered', 'cancelled')
    else false
  end;
$$;

-- Đặt hàng (thanh toán thử nghiệm). Giá lấy từ database, không tin giá phía client.
create function public.place_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method public.payment_method,
  p_client_request_id uuid
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
  v_subtotal integer := 0;
  v_count integer := 0;
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

  -- Gửi lại cùng một yêu cầu (double click, mạng chập chờn) → trả về đơn đã tạo.
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

  -- Gộp dòng trùng sản phẩm, khóa từng sản phẩm theo thứ tự id để tránh deadlock khi đặt đồng thời.
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

  v_code := 'TT' || to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYMMDD')
    || lpad(nextval('public.order_code_seq')::text, 4, '0');

  begin
    insert into public.orders (
      code, user_id, client_request_id, status, payment_method,
      recipient_name, phone, address, ward, province, note,
      subtotal, shipping_fee, total, item_count
    ) values (
      v_code, v_user, p_client_request_id, 'pending', p_payment_method,
      v_name, v_phone, v_address, v_ward, v_province, v_note,
      v_subtotal, public.shipping_fee_for(v_subtotal), v_subtotal + public.shipping_fee_for(v_subtotal), v_count
    )
    returning id into v_order_id;
  exception when unique_violation then
    -- Hai yêu cầu cùng client_request_id chạy song song: trả về đơn của yêu cầu thắng.
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

  insert into public.order_events (order_id, status, note, created_by)
  values (v_order_id, 'pending', 'Đơn hàng đã được tạo', v_user);

  return query select v_order_id, v_code;
end;
$$;

-- Hoàn kho khi hủy đơn (dùng nội bộ).
create function public.restock_order(p_order_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.products p
  set stock = least(p.stock + oi.quantity, 100000)
  from public.order_items oi
  where oi.order_id = p_order_id and oi.product_id = p.id;
$$;

-- Admin cập nhật trạng thái đơn theo đúng luồng; hủy đơn → hoàn kho.
create function public.admin_update_order_status(
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
  end if;

  insert into public.order_events (order_id, status, note, created_by)
  values (p_order_id, p_status, left(btrim(coalesce(p_note, '')), 500), auth.uid());

  return p_status;
end;
$$;

-- Khách tự hủy đơn của mình khi đơn còn "Chờ xác nhận".
create function public.cancel_my_order(p_order_id uuid)
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

  insert into public.order_events (order_id, status, note, created_by)
  values (p_order_id, 'cancelled', 'Khách hàng hủy đơn', v_user);

  return 'cancelled';
end;
$$;

-- Số liệu tổng quan cho dashboard admin.
create function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'orders_total', (select count(*) from public.orders),
    'orders_pending', (select count(*) from public.orders where status = 'pending'),
    'orders_by_status', (
      select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
      from (select status, count(*) as n from public.orders group by status) s
    ),
    'revenue_delivered', (select coalesce(sum(total), 0) from public.orders where status = 'delivered'),
    'revenue_open', (
      select coalesce(sum(total), 0) from public.orders where status in ('pending', 'confirmed', 'shipping')
    ),
    'units_in_stock', (select coalesce(sum(stock), 0) from public.products),
    'low_stock', (select count(*) from public.products where stock between 1 and 5),
    'out_of_stock', (select count(*) from public.products where stock = 0),
    'hidden_products', (select count(*) from public.products where not is_visible)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.shipping_fee_for(integer) from public;
grant execute on function public.shipping_fee_for(integer) to anon, authenticated;
revoke all on function public.can_transition_order(public.order_status, public.order_status) from public;
grant execute on function public.can_transition_order(public.order_status, public.order_status) to anon, authenticated;
revoke all on function public.place_order(jsonb, jsonb, public.payment_method, uuid) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, public.payment_method, uuid) to authenticated;
revoke all on function public.restock_order(uuid) from public, anon, authenticated;
revoke all on function public.admin_update_order_status(uuid, public.order_status, text) from public, anon;
grant execute on function public.admin_update_order_status(uuid, public.order_status, text) to authenticated;
revoke all on function public.cancel_my_order(uuid) from public, anon;
grant execute on function public.cancel_my_order(uuid) to authenticated;
revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
