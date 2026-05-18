import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // 1. Verify caller session
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2. Verify caller role = admin
  const profileRes = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: "user" | "admin" | "supplier" }>()
  if (!profileRes.data || profileRes.data.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 3. Self-delete guard
  if (user.id === id) {
    return NextResponse.json(
      { error: "cannot_delete_self" },
      { status: 400 },
    )
  }

  // 4. Hard delete via service-role admin client
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "service_role_key_missing" },
      { status: 500 },
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
