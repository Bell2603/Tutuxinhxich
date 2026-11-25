-- Giới hạn tần suất chatbot theo IP (M17).
-- IP KHÔNG lưu thô: server băm SHA-256 kèm salt bí mật (CHAT_IP_SALT) trước khi gọi RPC.
-- Bảng không mở cho anon/authenticated; chỉ RPC security definer bên dưới được ghi.

create table public.chat_rate_limits (
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  bucket text not null check (bucket in ('minute', 'day')),
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  primary key (ip_hash, bucket, window_start)
);

alter table public.chat_rate_limits enable row level security;
revoke all on table public.chat_rate_limits from public, anon, authenticated;

create index chat_rate_limits_window_idx on public.chat_rate_limits (window_start);

-- Ghi nhận 1 lượt hỏi và cho biết còn được hỏi không.
-- Trả về allowed=false + số giây cần chờ khi vượt giới hạn phút hoặc ngày (ngày theo giờ Việt Nam).
create function public.chat_rate_hit(p_ip_hash text, p_per_minute integer, p_per_day integer)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_minute timestamptz := date_trunc('minute', v_now);
  v_day timestamptz := (date_trunc('day', v_now at time zone 'Asia/Ho_Chi_Minh')) at time zone 'Asia/Ho_Chi_Minh';
  v_minute_hits integer;
  v_day_hits integer;
begin
  if p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if p_per_minute is null or p_per_minute not between 1 and 60
     or p_per_day is null or p_per_day not between 1 and 1000 then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  insert into public.chat_rate_limits as r (ip_hash, bucket, window_start, hits)
  values (p_ip_hash, 'minute', v_minute, 1)
  on conflict (ip_hash, bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into v_minute_hits;

  insert into public.chat_rate_limits as r (ip_hash, bucket, window_start, hits)
  values (p_ip_hash, 'day', v_day, 1)
  on conflict (ip_hash, bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into v_day_hits;

  -- Dọn cửa sổ cũ thỉnh thoảng (≈ 2% lượt gọi) để bảng không phình.
  if random() < 0.02 then
    delete from public.chat_rate_limits where window_start < v_now - interval '2 days';
  end if;

  if v_day_hits > p_per_day then
    return query select false, greatest(1, ceil(extract(epoch from (v_day + interval '1 day' - v_now)))::integer);
  elsif v_minute_hits > p_per_minute then
    return query select false, greatest(1, ceil(extract(epoch from (v_minute + interval '1 minute' - v_now)))::integer);
  else
    return query select true, 0;
  end if;
end;
$$;

revoke all on function public.chat_rate_hit(text, integer, integer) from public;
grant execute on function public.chat_rate_hit(text, integer, integer) to anon, authenticated;
