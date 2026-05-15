-- ============================================================
-- Thêm column status_updated_at vào orders cho notification flow phía user.
-- Set khi orders.status thay đổi (confirm / complete / cancel).
-- ============================================================

alter table public.orders
  add column if not exists status_updated_at timestamptz;

create or replace function public.set_order_status_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_updated_at_trg on public.orders;
create trigger orders_status_updated_at_trg
  before update on public.orders
  for each row execute function public.set_order_status_updated_at();

-- Backfill: đơn đã rời pending nhưng chưa có timestamp → ước lượng = created_at
-- (chỉ ảnh hưởng thứ tự sort, không sai logic).
update public.orders
  set status_updated_at = created_at
  where status <> 'pending' and status_updated_at is null;
