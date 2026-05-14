-- ============================================================
-- Thêm column reviewed_at vào product_submissions cho notification flow.
-- Set khi admin approve hoặc reject.
-- ============================================================

alter table public.product_submissions
  add column if not exists reviewed_at timestamptz;

-- Backfill: submission đã approve/reject trước đây không có timestamp review,
-- ước lượng = submitted_at để sort không lỗi (chỉ ảnh hưởng thứ tự, không sai logic).
update public.product_submissions
  set reviewed_at = submitted_at
  where upload_status in ('approved', 'rejected')
    and reviewed_at is null;
