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
