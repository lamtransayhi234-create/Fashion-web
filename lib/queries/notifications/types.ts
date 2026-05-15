/**
 * Shape used by Bell dropdown UI.
 * Real hook (Task N.4) returns same shape; mock array (Task N.0) matches.
 */
export type SupplierNotification = {
  id: string
  type: "approved" | "rejected"
  productName: string
  productSrc: string
  rejectReason?: string
  reviewedAt: string                  // ISO timestamp
}

/**
 * Notification cho khách (role=user) khi supplier đổi trạng thái đơn.
 * Derive từ bảng orders + cột status_updated_at (migration 0006).
 */
export type UserOrderNotification = {
  id: string                          // order id
  status: "confirmed" | "completed" | "cancelled"
  productName: string
  productSrc: string
  statusUpdatedAt: string             // ISO timestamp
}
