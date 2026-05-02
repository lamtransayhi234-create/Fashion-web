# Product Data Design — StyleLoop

## Tóm tắt

Thiết kế mảng dữ liệu mock cho trang `/products` và product detail. Hỗ trợ filter nhiều chiều (loại đồ, size, màu, giá, khu vực, tags) và 3 roles: user, provider, admin.

---

## Types

### Provider

```ts
type Provider = {
  id: string
  shopName: string   // "Minhchau Closet"
  handle: string     // "@minhchau.closet"
  avatar: string
  location: string   // "Quận 3" | "Đống Đa" | ...
}
```

### Product

```ts
type Product = {
  id: string
  src: string
  name: string
  brandPrice: number            // giá hãng gốc (VNĐ)
  rentalPrice: number           // giá thuê/ngày (VNĐ)
  status: "available" | "out_of_stock"
  description: string
  category: "Trang phục" | "Giày Dép" | "Phụ Kiện"
  type:
    | "Váy & Đầm"
    | "Áo kiểu"
    | "Chân váy"
    | "Set"
    | "Giày Dép"
    | "Mũ & Nón"
    | "Trang sức"
  sizes: ("XS" | "S" | "M" | "L" | "XL")[]
  color: string
  tags: string[]
  rating: 4 | 5
  providerId: string
}
```

---

## Filter dimensions (trang /products)

| Filter | Field | Loại UI |
|---|---|---|
| Danh mục lớn | `category` | Tab/menu top |
| Loại đồ | `type` | Checkbox sidebar |
| Kích cỡ | `sizes` | Checkbox sidebar |
| Màu sắc | `color` | Color swatch |
| Mức giá | `rentalPrice` | Slider |
| Khu vực | `provider.location` | Checkbox sidebar |
| Phong cách/dịp | `tags` | Checkbox sidebar |

---

## Nguồn ảnh (public/products/web styleloop/)

| Folder | type | Số ảnh |
|---|---|---|
| Trang phục/Váy & Đầm | Váy & Đầm | 23 |
| Trang phục/Áo kiểu | Áo kiểu | 12 |
| Trang phục/Chân váy | Chân váy | 12 |
| Trang phục/Set đồ phối sẵn | Set | 10 |
| Giày Dép | Giày Dép | 12 |
| Phụ Kiện/Mũ - nón - mấn | Mũ & Nón | 8 |
| Phụ Kiện/Trang sức & Phụ kiện khác | Trang sức | 13 |

Tổng: ~90 sản phẩm mock.

---

## Quyết định thiết kế

- `Provider` tách riêng để admin quản lý, provider tự edit shop.
- `category` (cấp cha) + `type` (cấp con) để hỗ trợ tab lớn + filter sidebar.
- `rating` chỉ là `4 | 5` (hardcode mock, không có lẻ).
- 1 ảnh duy nhất (`src`), không có gallery.
- `sizes[]` là array vì 1 sản phẩm có nhiều size.
- `color` là 1 string duy nhất.
- `providerId` ref sang `Provider.id` để dễ nâng lên API sau.
