# Supplier Product Upload & Admin Review — Design Spec

**Date:** 2026-05-03
**Status:** Approved

---

## Overview

Supplier đăng sản phẩm lên hệ thống → sản phẩm chờ admin duyệt → admin approve/reject → cập nhật trạng thái về cho supplier. Sản phẩm được approve sẽ tự động xuất hiện trong shop.

---

## 1. Data Layer

### 1.1 Types mới (trong `lib/data/products.ts`)

```typescript
export type UploadStatus = "pending" | "approved" | "rejected"

export type SubmittedProduct = {
  id: string                  // gen lúc submit (sub-{Date.now()})
  supplierId: string
  supplierName: string
  shopName: string
  uploadStatus: UploadStatus
  submittedAt: string         // ISO timestamp
  rejectReason?: string       // chỉ có khi rejected
  // — Product fields —
  src: string                 // URL từ imgbb
  name: string
  brandPrice: number
  rentalPrice: number
  description: string
  category: ProductCategory
  type: ProductType
  sizes: ProductSize[]
  color: string
  tags: string[]
}
```

`rating` không có trong form — tự gán `5` khi admin approve.

---

### 1.2 `lib/store/product-store.ts` (file mới)

```typescript
type ProductState = {
  allProducts: Product[]           // seed từ static + approved từ supplier
  submittedProducts: SubmittedProduct[]  // tất cả: pending + approved + rejected

  submitProduct: (data: Omit<SubmittedProduct, "id" | "supplierId" | "supplierName" | "shopName" | "uploadStatus" | "submittedAt">, supplier: PublicUser) => void
  approveProduct: (id: string) => void
  rejectProduct: (id: string, reason: string) => void
}
```

**Seed strategy:**
- `allProducts` default = mảng tĩnh `products[]` import từ `products.ts`
- Zustand `persist` override sau lần đầu — seed chỉ chạy khi chưa có persisted state
- Dùng `version` để reset nếu cần migration sau

**`approveProduct(id)`:**
1. Tìm item trong `submittedProducts` theo `id`
2. Tạo `Product` mới: copy tất cả fields + `rating: 5`, `providerId: supplierId`, `status: "available"`
3. Thêm vào `allProducts`
4. Cập nhật item trong `submittedProducts`: `uploadStatus = "approved"` (giữ lại để supplier xem lịch sử)

**`rejectProduct(id, reason)`:**
1. Tìm item trong `submittedProducts`
2. Cập nhật: `uploadStatus = "rejected"`, `rejectReason = reason`

**Các trang cần cập nhật source:**
- `app/(home)/products/page.tsx` — đổi từ import static → `useProductStore().allProducts`
- `app/(home)/product/[id]/page.tsx` — tương tự
- `app/(home)/payment/page.tsx` — kiểm tra nếu có dùng product list

---

## 2. Trang `/supplier`

**Route:** `app/(home)/supplier/page.tsx`

**Guard:**
- Chưa đăng nhập → redirect `/login`
- Đã đăng nhập nhưng role ≠ `"supplier"` → redirect `/`

**Layout:** 2 tab

### Tab 1 — "Sản phẩm của tôi"

- Query: `useProductStore().submittedProducts.filter(p => p.supplierId === user.id)`
- Mỗi card hiển thị:
  - Ảnh thumbnail (60×60)
  - Tên sản phẩm + danh mục/loại
  - Giá thuê/ngày
  - Badge trạng thái:
    - `Chờ duyệt` — vàng (`oklch(0.75 0.12 80)`)
    - `Đã duyệt` — xanh (`oklch(0.65 0.14 145)`)
    - `Từ chối` — đỏ (`oklch(0.55 0.15 25)`)
  - Nếu `rejected` → hiển thị `rejectReason` dưới badge (text nhỏ, màu muted)
  - Ngày submit
- Empty state: "Bạn chưa đăng sản phẩm nào"

### Tab 2 — "Đăng sản phẩm mới"

Form fields:

| Trường | Input type | Ghi chú |
|---|---|---|
| Ảnh | Upload button | Gọi imgbb API, hiển thị preview sau khi upload |
| Tên sản phẩm | text | required |
| Danh mục | select | Trang phục / Giày Dép / Phụ Kiện |
| Loại | select | Lọc động theo danh mục |
| Giá gốc | number | VNĐ, required |
| Giá thuê/ngày | number | VNĐ, required |
| Mô tả | textarea | required |
| Sizes | checkbox group | Lọc theo loại: quần áo (XS–XL) / giày (35–39) / phụ kiện (Free Size) |
| Màu sắc | text | required |
| Tags | chip input | Optional, enter để thêm tag |

**imgbb upload flow:**
1. Supplier chọn file ảnh
2. POST lên `https://api.imgbb.com/1/upload` với API key (`NEXT_PUBLIC_IMGBB_API_KEY` trong `.env.local`)
3. Nhận URL ảnh → preview
4. URL được lưu vào field `src` của form

**Submit:**
- Validate required fields
- Gọi `submitProduct(formData, user)`
- Toast thành công → tự chuyển về Tab 1
- Sản phẩm xuất hiện ngay với badge "Chờ duyệt"

---

## 3. Trang `/admin`

**Route:** `app/(home)/admin/page.tsx`

**Guard:**
- Chưa đăng nhập → redirect `/login`
- Đã đăng nhập nhưng role ≠ `"admin"` → redirect `/`

**Layout:** Header info admin + 2 tab

### Tab 1 — "Chờ duyệt"

- Badge số lượng trên tab: `Chờ duyệt (n)`
- Query: `submittedProducts.filter(p => p.uploadStatus === "pending")`
- Mỗi card ngang gồm:
  - Trái: ảnh thumbnail (80×80)
  - Giữa:
    - Tên sản phẩm (bold)
    - Danh mục / Loại / Màu
    - Giá gốc + giá thuê/ngày
    - Sizes (chips nhỏ)
    - Mô tả (truncate 2 dòng)
    - Info supplier: tên shop + tên người + ngày submit
  - Phải: 2 nút
    - **"Duyệt"** (primary, camel) → `approveProduct(id)`, card biến mất
    - **"Từ chối"** (outline, danger) → expand inline form nhập lý do
- Inline reject form:
  - Textarea: "Lý do từ chối..."
  - Nút "Xác nhận từ chối" + "Huỷ"
  - Submit → `rejectProduct(id, reason)` → card biến mất
- Empty state: "Không có sản phẩm nào đang chờ duyệt ✦"

### Tab 2 — "Đã xử lý"

- Query: `submittedProducts.filter(p => p.uploadStatus !== "pending")`
- Hiển thị read-only, cùng layout card nhưng không có action buttons
- Badge trạng thái: Đã duyệt / Từ chối + lý do nếu có
- Để admin tra cứu lịch sử

---

## 4. Approve Flow (full)

```
Supplier submit form
  → submitProduct() 
  → submittedProducts.push({ uploadStatus: "pending", ... })
  → Supplier thấy badge "Chờ duyệt"

Admin vào /admin Tab 1
  → thấy card sản phẩm (filter uploadStatus === "pending")

Admin click "Duyệt"
  → approveProduct(id)
  → allProducts.push({ ...submittedProduct, rating: 5, providerId: supplierId, status: "available" })
  → submittedProducts[i].uploadStatus = "approved"
  → Card biến khỏi Tab 1, xuất hiện ở Tab 2
  → Sản phẩm live trên /products
  → Supplier thấy badge "Đã duyệt"

Admin click "Từ chối" → nhập lý do → confirm
  → rejectProduct(id, reason)
  → submittedProducts[i].uploadStatus = "rejected"
  → submittedProducts[i].rejectReason = reason
  → Card biến khỏi Tab 1, xuất hiện ở Tab 2
  → Supplier thấy badge "Từ chối" + lý do
```

---

## 5. Scope — Files cần tạo / sửa

| File | Action |
|---|---|
| `lib/data/products.ts` | Thêm type `UploadStatus`, `SubmittedProduct` |
| `lib/store/product-store.ts` | Tạo mới |
| `.env.local` | Thêm `NEXT_PUBLIC_IMGBB_API_KEY` |
| `app/(home)/supplier/page.tsx` | Tạo mới |
| `app/(home)/admin/page.tsx` | Tạo mới |
| `app/(home)/products/page.tsx` | Đổi source sang product-store |
| `app/(home)/product/[id]/page.tsx` | Đổi source sang product-store |

**Không chạm vào:** `auth-store.ts`, `site-header.tsx` (header đã có link `/supplier` và `/admin` sẵn)

---

## 6. Design System constraints

Toàn bộ UI theo CLAUDE.md:
- Font: Playfair Display duy nhất
- Màu: beige/tan/espresso palette — không dùng pink, purple, mint
- Button primary: `.ribbon-tan`
- Badge pending: `oklch(0.78 0.10 75)` (vàng ấm)
- Badge approved: `oklch(0.55 0.12 145)` (xanh trung tính)
- Badge rejected: `oklch(0.50 0.12 25)` (đỏ nâu)
- Radius: `rounded-md`, `rounded-full` — không dùng `rounded-3xl`
- Icon: `lucide-react` strokeWidth `1.4`
