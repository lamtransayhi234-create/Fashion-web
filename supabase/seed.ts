/**
 * Seed script — chạy 1 lần để populate Supabase với:
 *   - 5 demo accounts (2 user + 2 supplier + 1 admin)
 *   - ~30 mock products (remap providerId về 2 supplier seed)
 *
 * Run: pnpm seed
 * Idempotent: rerun sẽ skip user đã tồn tại + skip product nếu đã có row.
 */

import { createClient } from "@supabase/supabase-js"

import { products as mockProducts } from "../lib/data/products.js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const AVATAR_USER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Ccircle cx='50' cy='36' r='20' fill='%23b8956a'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='22' fill='%23b8956a'/%3E%3C/svg%3E"
const AVATAR_SUPPLIER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Crect x='22' y='48' width='56' height='34' fill='%23b8956a'/%3E%3Cpolygon points='14,48 86,48 76,22 24,22' fill='%238b6f4e'/%3E%3Crect x='40' y='62' width='20' height='20' fill='%23e8dcc8'/%3E%3C/svg%3E"
const AVATAR_ADMIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231c1917'/%3E%3Ctext x='50' y='68' font-size='52' font-weight='bold' text-anchor='middle' fill='%23f0e4d0' font-family='Georgia%2Cserif'%3EA%3C/text%3E%3C/svg%3E"

type DemoAccount = {
  mockId: string  // id cũ trong code (u-001, s-001, ...) — để map products
  email: string
  password: string
  name: string
  role: "user" | "admin" | "supplier"
  shop_name?: string
  phone?: string
  address?: string
  avatar: string
  permissions?: string[]
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { mockId: "u-001", email: "user1@styleloop.vn", password: "user123", name: "Linh Nguyễn", role: "user", avatar: AVATAR_USER },
  { mockId: "u-002", email: "user2@styleloop.vn", password: "user123", name: "Trang Phạm", role: "user", avatar: AVATAR_USER },
  {
    mockId: "a-001", email: "admin@styleloop.vn", password: "admin123", name: "Vincent Lê",
    role: "admin", avatar: AVATAR_ADMIN,
    permissions: ["users.manage", "orders.manage", "products.manage", "reports.view"],
  },
  {
    mockId: "s-001", email: "supplier1@styleloop.vn", password: "supplier123", name: "Bảo Lê",
    role: "supplier", shop_name: "Bảo Closet", phone: "0931111111",
    address: "120 Phan Xích Long, Q.Phú Nhuận, TP.HCM", avatar: AVATAR_SUPPLIER,
  },
  {
    mockId: "s-002", email: "supplier2@styleloop.vn", password: "supplier123", name: "Yến Vũ",
    role: "supplier", shop_name: "Yến Vintage", phone: "0932222222",
    address: "55 Trần Hưng Đạo, Q.5, TP.HCM", avatar: AVATAR_SUPPLIER,
  },
]

async function ensureUser(acc: DemoAccount): Promise<string> {
  // Check exist trước
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === acc.email)
  if (existing) {
    console.log(`  ↺ ${acc.email} đã tồn tại (${existing.id})`)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: {
      name: acc.name,
      role: acc.role,
      shop_name: acc.shop_name,
      phone: acc.phone,
      address: acc.address,
      avatar: acc.avatar,
    },
  })
  if (error) throw error
  if (!data.user) throw new Error("createUser returned no user")
  console.log(`  ✓ ${acc.email} (${data.user.id})`)

  // Permissions chỉ set khi admin (trigger không đẩy permissions)
  if (acc.permissions) {
    const { error: permErr } = await admin
      .from("profiles")
      .update({ permissions: acc.permissions })
      .eq("id", data.user.id)
    if (permErr) console.warn(`    ⚠ permissions update failed: ${permErr.message}`)
  }
  return data.user.id
}

async function seedProducts(mockToUuid: Map<string, string>) {
  const s1 = mockToUuid.get("s-001")
  const s2 = mockToUuid.get("s-002")
  if (!s1 || !s2) throw new Error("Missing supplier UUIDs")

  // Remap: s-001/s-003/s-005 → S1, s-002/s-004 → S2
  const remap = (oldId: string) => {
    const idx = Number(oldId.split("-")[1])
    return idx % 2 === 1 ? s1 : s2
  }

  // Skip nếu đã có row nào cho seed supplier (tránh duplicate)
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("provider_id", [s1, s2])
  if (count && count > 0) {
    console.log(`  ↺ products: đã có ${count} row, skip seed.`)
    return
  }

  const rows = mockProducts.map((p) => ({
    src: p.src,
    name: p.name,
    brand_price: p.brandPrice,
    rental_price: p.rentalPrice,
    status: p.status,
    description: p.description,
    category: p.category,
    type: p.type,
    sizes: p.sizes,
    color: p.color,
    tags: p.tags,
    rating: p.rating,
    provider_id: remap(p.providerId),
  }))

  const { error } = await admin.from("products").insert(rows)
  if (error) throw error
  console.log(`  ✓ inserted ${rows.length} products`)
}

async function main() {
  console.log("→ Seeding demo accounts...")
  const mockToUuid = new Map<string, string>()
  for (const acc of DEMO_ACCOUNTS) {
    const id = await ensureUser(acc)
    mockToUuid.set(acc.mockId, id)
  }

  console.log("→ Seeding products...")
  await seedProducts(mockToUuid)

  console.log("✓ Done.")
}

main().catch((e) => {
  console.error("✗ Seed failed:", e)
  process.exit(1)
})
