# Supplier Orders — Design Spec

**Date:** 2026-05-03
**Status:** Approved

---

## Overview

Khi user đặt thuê sản phẩm, đơn sẽ ở trạng thái `"pending"` chờ supplier xác nhận. Supplier có trang `/account/ordered` riêng để xem và xác nhận các đơn thuê sản phẩm của shop mình.

---

## 1. Data Layer

### 1.1 Align Provider IDs với Supplier IDs

Đổi `providers[]` trong `lib/data/products.ts` để ID khớp với supplier account IDs:

| Cũ | Mới | Supplier account |
|---|---|---|
| `prov001` | `s-001` | Bảo Lê — Bảo Closet |
| `prov002` | `s-002` | Yến Vũ — Yến Vintage |
| `prov003` | `s-003` | Khoa Trịnh — Khoa Y2K Studio |
| `prov004` | `s-004` | *(mock mới)* |
| `prov005` | `s-005` | *(mock mới)* |

Tất cả `products[]` cũng đổi `providerId` theo (prov001 → s-001, v.v.).

**Thêm 2 mock suppliers vào `MOCK_SUPPLIERS`:**
```typescript
{ id: "s-004", shopName: "GenZ Vibes Studio", name: "Lan Hoàng", ... }
{ id: "s-005", shopName: "Linh Fashion House", name: "Minh Linh", ... }
```

**Kết quả:** Supplier `s-001` filter `order.providerId === user.id` → ra đúng đơn của mình, không cần field mapping phụ.

---

### 1.2 Order type — thêm `providerId`

```typescript
// lib/store/auth-store.ts
export type Order = {
  ...hiện tại...
  providerId: string   // ← thêm — ID của supplier sở hữu sản phẩm
}
```

---

### 1.3 PendingRental — thêm `providerId`

```typescript
// lib/store/order-store.ts
export type PendingRental = {
  ...hiện tại...
  providerId: string   // ← thêm
}
```

---

### 1.4 `addOrder` — nhận `providerId`, đổi default status

```typescript
// auth-store.ts — addOrder action
// Trước: status: "confirmed"
// Sau:   status: "pending"
// Nhận thêm: providerId trong orderData
```

---

### 1.5 Thêm action `confirmOrder`

```typescript
confirmOrder: (orderId: string) => void
```

Logic:
- Scan toàn bộ `users[]`
- Tìm user có `orders[]` chứa order với `id === orderId`
- Set `order.status = "confirmed"`
- Update `users[]` + `user` trong store

---

## 2. Order Creation Flow

### Product rental form (component)
- Đọc `product.providerId`
- Truyền vào `setPending({ ...data, providerId: product.providerId })`

### Payment page (`app/(home)/payment/page.tsx`)
- Đọc `pending.providerId`
- Truyền vào `addOrder({ ...data, providerId: pending.providerId, status: "pending" })`

---

## 3. Trang `/account/ordered`

**Route:** `app/(home)/account/ordered/page.tsx`

**Guard:**
- Chưa đăng nhập → redirect `/login`
- Role ≠ `"supplier"` → redirect `/`

**Data query:**
```typescript
const myOrders = useAuthStore((s) => s.users)
  .flatMap((u) => u.orders)
  .filter((o) => o.providerId === user.id)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
```

**Layout:**
- Header: "Đơn thuê của shop" + tên shop + stats (tổng đơn / đang chờ / đang thuê)
- Sub-tab filter: Tất cả / Chờ xác nhận / Đang thuê / Hoàn thành / Đã hủy
- Danh sách card đơn

**Mỗi card đơn:**
- Ảnh + tên sản phẩm, loại, size, màu
- Tên khách thuê (lấy từ `users.find(u => u.id === order.userId)?.name` — `Order.userId` đã có sẵn)
- Địa chỉ giao hàng
- Ngày thuê: from → to, số đêm
- Tổng tiền + tiền cọc
- Phương thức thanh toán
- Ngày đặt
- Badge trạng thái (dùng lại `getRentalStatus` logic)
- Nút **"Xác nhận đơn"** khi `status === "pending"` → gọi `confirmOrder(orderId)` → toast thành công

**Empty state** khi không có đơn nào.

---

## 4. Navigation

Thêm link `/account/ordered` vào header dropdown cho supplier:

```typescript
// site-header.tsx — menu items cho supplier
{ href: "/supplier",         icon: Store,         label: "Cửa hàng của tôi" },
{ href: "/account/ordered",  icon: ShoppingBag,   label: "Đơn thuê của shop" },  // ← thêm
```

---

## 5. User-facing impact

- Sau khi đặt: `status: "pending"` → hiển thị badge **"Chờ xác nhận"** (đã có config trong `RENTAL_STATUS_CONFIG`)
- Sau khi supplier confirm: `status: "confirmed"` → flow date-based như cũ (`upcoming` / `active` / `overdue`)

---

## 6. Files cần sửa / tạo

| File | Action |
|---|---|
| `lib/data/products.ts` | Đổi provider IDs + product providerId |
| `lib/store/auth-store.ts` | Thêm `providerId` vào `Order`, thêm `confirmOrder` action, sửa `addOrder` |
| `lib/store/order-store.ts` | Thêm `providerId` vào `PendingRental` |
| `components/product-rental-form.tsx` | Truyền `providerId` vào `setPending` |
| `app/(home)/payment/page.tsx` | Truyền `providerId` vào `addOrder`, đổi status |
| `app/(home)/account/ordered/page.tsx` | Tạo mới |
| `components/site-header.tsx` | Thêm link "Đơn thuê của shop" cho supplier |
