# StyleLoop — Design System (read this before building UI)

This project uses a strict **editorial / luxury-beige** aesthetic and a **single-font** rule. When you add new pages or components, follow these tokens **exactly** — do not reintroduce pink/purple/multi-font styling from earlier commits.

---

## 1. Font — ONE font only

Everything (display, headings, body, prices, buttons, captions) uses **Playfair Display** (loaded in `app/layout.tsx` via `next/font/google` as `--font-display`).

- Tailwind aliases all map to the same var: `font-sans`, `font-display`, `font-headline`, `font-body`, `font-script` are equivalent.
- For decorative italic phrases, use `italic` + lighter weight (`font-medium` or `font-normal`), not a second font.
- For "small caps / label" feel, use `uppercase tracking-[0.22em]` to `tracking-[0.32em]`.
- Never import another Google font. Never use `Inter`, `Be_Vietnam_Pro`, `Newsreader`, `Caveat`, `Space Grotesk`, `Geist`, etc.

```tsx
// ✅
<h1 className="font-display text-[58px] font-medium tracking-[-0.01em] uppercase">
  Tiêu đề <span className="italic normal-case text-[oklch(0.6_0.062_60)]">phụ</span>
</h1>

// ❌ Don't add another font family
import { Inter } from "next/font/google"
```

---

## 2. Color palette — warm beige / tan / dark brown

CSS tokens live in `app/globals.css` (`:root`). Use them via `bg-background`, `text-foreground`, `bg-primary`, etc., or reach for the raw OKLCH when you need a one-off shade.

| Role | OKLCH value | Hex-ish | Use for |
|---|---|---|---|
| `--background` (cream) | `oklch(0.962 0.012 78)` | warm ivory | Page background |
| `--foreground` (espresso) | `oklch(0.24 0.018 55)` | dark warm brown | Primary text |
| `--card` | `oklch(0.995 0.004 80)` | near-white | Cards, panels |
| `--muted` (sand) | `oklch(0.94 0.014 75)` | soft beige | Subtle surfaces, marquee band |
| `--muted-foreground` | `oklch(0.48 0.022 60)` | mid brown | Secondary text |
| `--border` | `oklch(0.88 0.018 70)` | beige hairline | Borders, dividers |
| `--primary` (camel) | `oklch(0.6 0.062 60)` | warm tan | CTA buttons, accent strokes, italic emphasis |
| `--accent` | `oklch(0.86 0.034 70)` | light tan | Secondary highlights, italic words on dark bg |
| `--secondary` (sand-2) | `oklch(0.91 0.022 75)` | beige-tan | Chips, soft pills |
| espresso (footer/about) | `oklch(0.18 0.014 55)` | near-black warm | Dark sections (footer, About Us, CTA) |

**Custom theme tokens also exposed:** `bg-cream`, `bg-sand`, `bg-tan`, `bg-camel`, `bg-mocha`, `bg-espresso` (and matching `text-*`).

### Strict rules
- **No pink, magenta, lilac, mint, butter, peach gradients.** Replace any with the beige/tan/brown scale.
- **No bright color gradients on buttons.** Use `.ribbon-tan` (helper class) or solid `bg-[oklch(0.18_0.014_55)]` / `bg-[oklch(0.6_0.062_60)]`.
- **No purple shadows** (`shadow-pink-300/40`, etc.). Use warm shadows: `shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.4)]`.
- Dark sections always use `oklch(0.18 0.014 55)` background with `oklch(0.97 0.012 78)` text and `oklch(0.78 0.04 70)` accent strokes.

---

## 3. Helper utilities (already in `globals.css`)

| Class | Purpose |
|---|---|
| `.ribbon-tan` | Primary CTA — solid camel button with subtle inner highlight + warm shadow |
| `.editorial-rule` | Decorative gradient hairline divider |
| `.underline-script` | SVG hand-drawn underline in tan, for italic emphasis words |
| `.dashed-border` | Tan dashed bottom border |
| `.shimmer-text` | Slow shimmer across espresso → camel → espresso (for premium accents) |
| `.bg-cream-hero` / `.bg-cream-soft` / `.bg-cream-warm` | Pre-built beige radial backgrounds for page sections |
| `.bg-cream-grid` / `.bg-halftone-tan` / `.bg-tan-stripes` | Subtle texture overlays |
| `.bg-noise` / `.grain` | Film-grain overlay |
| `.rotated-card-1/2/3` | Slight rotations for editorial collage frames |
| `.soft-shadow` | Refined warm card shadow |
| `.animate-float-soft` / `.animate-drift` / `.animate-twinkle` / `.animate-marquee` | Atmospheric motion |

---

## 4. Composition patterns

**Eyebrow label** (above every section heading):
```tsx
<div className="flex items-center gap-3">
  <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
  <span className="text-[11px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.024_60)] uppercase">
    ✦ Section label ✦
  </span>
</div>
```

**Section heading** (medium weight serif + italic accent in tan):
```tsx
<h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[52px]">
  Plain words <span className="italic text-[oklch(0.6_0.062_60)]">accent words</span>
</h2>
```

**Primary button** — always `.ribbon-tan` with uppercase tracking:
```tsx
<Button className="ribbon-tan h-auto rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase">
  Khám phá tủ đồ
</Button>
```

**Secondary button** — outline that inverts to espresso on hover:
```tsx
<Button variant="outline" className="rounded-full border border-[oklch(0.34_0.03_55)] bg-transparent px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase hover:bg-[oklch(0.18_0.014_55)] hover:text-[oklch(0.97_0.012_78)]">
  Cho thuê đồ
</Button>
```

**Card** — white surface with beige hairline ring + warm shadow, slim radius (`rounded-md`, not `rounded-3xl`):
```tsx
<div className="rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.86_0.018_70)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] p-6">
  …
</div>
```

**Image frame** (editorial / lookbook feel) — apply `grayscale-[0.05]` to `grayscale-[0.15]` on photos so they harmonise with the warm palette.

---

## 5. Layout & spacing rules

- Container: `max-w-7xl mx-auto px-8 lg:px-12`.
- Sections: `py-24` to `py-32`. Use generous whitespace.
- Border radii: prefer **slim** — `rounded-sm`, `rounded-md`, `rounded-full`. Avoid `rounded-3xl`+ except the rare hero blob.
- Borders are 1px hairlines, never 2-3px.
- Use **uppercase + wide tracking** for labels, dates, kickers, prices in lookbook frames, footer headings.
- Number kickers (01 / 02 / 03) instead of emoji bullets where possible.

---

## 6. Iconography & motifs

- Use `lucide-react` icons with `strokeWidth={1.4}` for a refined editorial line weight.
- Decorative glyphs: `✦` `✧` `N°` `★` (in italic). Avoid emoji-heavy headings.
- For italic emphasis, the script-feel comes from Playfair Display *italic*, not from a separate handwriting font.

---

## 7. Files to mirror when adding a new page

When you scaffold a new page (e.g. `/shop`, `/about`, `/blog/[slug]`), match these references:

- Hero pattern → `app/(home)/page.tsx` `HERO` section (lines starting `{/* ─────────── HERO ─────────── */}`)
- Dark manifesto / about block → `ABOUT US — manifesto` section in `app/(home)/page.tsx`
- Card grid → `HOT PRODUCTS` section + `components/product-card.tsx`
- Header / footer already global via `app/(home)/layout.tsx`. Reuse them for any new top-level layout.

---

## 8. Quick "do / don't"

✅ Do
- Use one font (Playfair Display) for everything.
- Stick to beige / tan / dark warm brown / cream tokens.
- Use uppercase + wide tracking for labels.
- Use slim radii, hairline borders, warm soft shadows.
- Use italic Playfair for emphasis instead of a script font.

❌ Don't
- Don't introduce pink (`oklch(*_*_350)`), purple (`*_305`), mint (`*_165`), butter (`*_95`) hues.
- Don't add a second font family.
- Don't use bright multi-color gradients on buttons.
- Don't use chunky `rounded-3xl` / `rounded-[40px]` on small cards.
- Don't add emoji-heavy headlines — at most one `✦`/`✧` motif per heading.

---

## 9. Backend — Supabase + React Query

App đã chuyển từ localStorage (Zustand persist) sang Supabase. Xem spec đầy đủ:
`docs/superpowers/specs/2026-05-14-supabase-migration-design.md`.

### Layers

| Layer | File | Trách nhiệm |
|---|---|---|
| Browser client | `lib/supabase/client.ts` (`getSupabase()`) | Singleton cho mọi Client Component / hook |
| Server client | `lib/supabase/server.ts` (`createSupabaseServerClient()`) | Server Component / route handler |
| Schema types | `lib/supabase/types.ts` | Hand-written, khớp `supabase/migrations/0001_init.sql` |
| Data hooks | `lib/queries/<domain>/use*.ts` | TanStack Query — 1 hook / file, gom theo domain |
| Auth session | `lib/store/auth-store.ts` | Zustand store — chỉ session (user, isAuthenticated, hydrated, login/logout/register/updateProfile/changePassword) |
| Storage | `components/image-uploader.tsx` + bucket `product-images` | Upload ảnh sản phẩm |

### Query hooks (lib/queries/)

```
products/  → useGetProducts, useGetProductDetail, useGetSubmissions,
             useSubmitProduct, useApproveProduct, useRejectProduct
orders/    → useGetOrders (auto-scope theo role), useAddOrder, useUpdateOrderStatus
whitelist/ → useGetWhitelist, useToggleWhitelist
providers/ → useGetProviders (suppliers list, cached 5 min)
queryKeys.ts → factory key duy nhất cho query + invalidation
```

Mọi mutation invalidate query key liên quan qua `qc.invalidateQueries({ queryKey: queryKeys.X.all })`.

### Auth flow

- Root layout wrap `app/providers.tsx` → `QueryClientProvider` + `AuthInit` (gọi `useAuthStore.getState().init()` 1 lần).
- `init()` đọc Supabase session + subscribe `onAuthStateChange` để sync cross-tab.
- Login/register/logout là method async trên store, không phải mutation React Query (vì session state cần đồng bộ với listener).

### Skeletons (components/skeletons/)

Mỗi page có data fetch có skeleton tương ứng — match layout thật (3:4 aspect, hairline ring, slim radii). Bật khi `isLoading` hoặc `!hydrated`:

```tsx
const { data, isLoading } = useGetProducts()
if (isLoading) return <ProductListSkeleton />
```

### Storage

- Bucket: `product-images` (public read)
- Path convention: `{user_id}/{uuid}.{ext}` → RLS owner-delete chỉ cho phép xoá file trong folder của mình
- Dùng `<ImageUploader value={url} onChange={setUrl} />`

### Demo accounts (seed)

| Email | Password | Role |
|---|---|---|
| `user1@styleloop.vn` | `user123` | Khách thuê |
| `user2@styleloop.vn` | `user123` | Khách thuê |
| `admin@styleloop.vn` | `admin123` | Quản trị viên |
| `supplier1@styleloop.vn` | `supplier123` | Cung cấp (Bảo Closet) |
| `supplier2@styleloop.vn` | `supplier123` | Cung cấp (Yến Vintage) |

Re-seed: `pnpm seed` (idempotent — skip user/products đã tồn tại).

### Migration files

- `supabase/migrations/0001_init.sql` — 5 bảng + enums + trigger + RLS
- `supabase/migrations/0002_storage.sql` — bucket + storage policies

Apply qua Supabase Dashboard → SQL Editor (manual).
