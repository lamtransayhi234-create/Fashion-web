// Hand-written types khớp với supabase/migrations/0001_init.sql.
// Sau này khi schema thay đổi nhiều, có thể chuyển sang autogen
// bằng `pnpm gen:types` (yêu cầu supabase CLI login).

export type UserRole       = "user" | "admin" | "supplier"
export type OrderStatusDb  = "pending" | "confirmed" | "completed" | "cancelled"
export type UploadStatusDb = "pending" | "approved" | "rejected"
export type PaymentMethodDb = "bank" | "momo"
export type ProductStatusDb = "available" | "out_of_stock"

type ProfilesRow = {
  id:           string
  email:        string
  name:         string
  role:         UserRole
  phone:        string | null
  address:      string | null
  avatar:       string | null
  shop_name:    string | null
  permissions:  string[] | null
  created_at:   string
}

type ProductsRow = {
  id:            string
  src:           string
  name:          string
  brand_price:   number
  rental_price:  number
  status:        ProductStatusDb
  description:   string | null
  category:      string
  type:          string
  sizes:         string[]
  color:         string | null
  tags:          string[] | null
  rating:        4 | 5 | null
  provider_id:   string
  created_at:    string
}

type ProductSubmissionsRow = {
  id:             string
  supplier_id:    string
  src:            string
  name:           string
  brand_price:    number
  rental_price:   number
  description:    string | null
  category:       string
  type:           string
  sizes:          string[]
  color:          string | null
  tags:           string[] | null
  upload_status:  UploadStatusDb
  reject_reason:  string | null
  product_id:     string | null
  submitted_at:   string
}

type OrdersRow = {
  id:                    string
  user_id:               string
  provider_id:           string | null
  product_id:            string | null
  product_name:          string
  product_src:           string
  product_type:          string
  size:                  string
  color:                 string | null
  from_date:             string
  to_date:               string
  nights:                number
  rental_price_per_day:  number
  total:                 number
  deposit:               number
  address:               string
  phone:                 string
  payment_method:        PaymentMethodDb
  payment_method_label:  string
  note:                  string | null
  status:                OrderStatusDb
  created_at:            string
}

type WhitelistRow = {
  user_id:    string
  product_id: string
  created_at: string
}

// Generic helpers: Insert = optional cho các field có default; Update = tất cả optional.
type ProfilesInsert = Omit<ProfilesRow, "created_at"> & { created_at?: string }
type ProfilesUpdate = Partial<ProfilesInsert>

type ProductsInsert = Omit<ProductsRow, "id" | "status" | "created_at"> & {
  id?: string
  status?: ProductStatusDb
  created_at?: string
}
type ProductsUpdate = Partial<ProductsInsert>

type ProductSubmissionsInsert = Omit<ProductSubmissionsRow, "id" | "upload_status" | "submitted_at"> & {
  id?: string
  upload_status?: UploadStatusDb
  submitted_at?: string
}
type ProductSubmissionsUpdate = Partial<ProductSubmissionsInsert>

type OrdersInsert = Omit<OrdersRow, "id" | "status" | "created_at"> & {
  id?: string
  status?: OrderStatusDb
  created_at?: string
}
type OrdersUpdate = Partial<OrdersInsert>

type WhitelistInsert = Omit<WhitelistRow, "created_at"> & { created_at?: string }
type WhitelistUpdate = Partial<WhitelistInsert>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row:    ProfilesRow
        Insert: ProfilesInsert
        Update: ProfilesUpdate
      }
      products: {
        Row:    ProductsRow
        Insert: ProductsInsert
        Update: ProductsUpdate
      }
      product_submissions: {
        Row:    ProductSubmissionsRow
        Insert: ProductSubmissionsInsert
        Update: ProductSubmissionsUpdate
      }
      orders: {
        Row:    OrdersRow
        Insert: OrdersInsert
        Update: OrdersUpdate
      }
      whitelist: {
        Row:    WhitelistRow
        Insert: WhitelistInsert
        Update: WhitelistUpdate
      }
    }
    Views: Record<string, never>
    Functions: {
      current_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role:       UserRole
      order_status:    OrderStatusDb
      upload_status:   UploadStatusDb
      payment_method:  PaymentMethodDb
      product_status:  ProductStatusDb
    }
  }
}
