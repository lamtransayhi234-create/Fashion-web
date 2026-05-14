"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"

import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (url: string) => void
  className?: string
  /** Aspect ratio CSS — default "3 / 4" (portrait, khớp với product card) */
  aspect?: string
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const BUCKET = "product-images"

export function ImageUploader({
  value,
  onChange,
  className,
  aspect = "3 / 4",
}: Props) {
  const user = useAuthStore((s) => s.user)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    setError(null)
    if (!user) {
      setError("Vui lòng đăng nhập trước.")
      return
    }
    if (!file.type.startsWith("image/")) {
      setError("File phải là ảnh (JPG / PNG / WEBP).")
      return
    }
    if (file.size > MAX_BYTES) {
      setError("Ảnh tối đa 5MB.")
      return
    }

    setUploading(true)
    setProgress(10)
    try {
      const supabase = getSupabase()
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`

      setProgress(35)
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        })
      if (upErr) throw upErr

      setProgress(75)
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      if (!data?.publicUrl) throw new Error("Không lấy được public URL.")

      setProgress(100)
      onChange(data.publicUrl)
    } catch (e) {
      setError((e as Error).message ?? "Upload thất bại.")
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 600)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div
          className="relative w-full overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)]"
          style={{ aspectRatio: aspect }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh sản phẩm"
            className="absolute inset-0 size-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Xoá ảnh"
            className="absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[oklch(0.18_0.014_55/0.85)] text-[oklch(0.97_0.012_78)] transition-colors hover:bg-[oklch(0.18_0.014_55)]"
          >
            <X className="size-3.5" strokeWidth={1.6} />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-md border border-dashed bg-[oklch(0.96_0.012_78)] text-center transition-colors",
            uploading
              ? "border-[oklch(0.6_0.062_60)] bg-[oklch(0.94_0.014_75)] cursor-wait"
              : "border-[oklch(0.78_0.04_70)] hover:border-[oklch(0.6_0.062_60)] hover:bg-[oklch(0.94_0.014_75)]",
          )}
          style={{ aspectRatio: aspect }}
        >
          {uploading ? (
            <>
              <div className="flex size-11 items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-[oklch(0.97_0.012_78)]">
                <Upload className="size-5 animate-pulse" strokeWidth={1.4} />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.34_0.03_55)] uppercase">
                Đang tải lên…
              </span>
              <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-[oklch(0.88_0.018_70)]">
                <div
                  className="h-full bg-[oklch(0.6_0.062_60)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex size-11 items-center justify-center rounded-full bg-[oklch(0.88_0.018_70)] text-[oklch(0.34_0.03_55)] transition-colors group-hover:bg-[oklch(0.6_0.062_60)] group-hover:text-[oklch(0.97_0.012_78)]">
                <Upload className="size-5" strokeWidth={1.4} />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.24_0.018_55)] uppercase">
                Chọn ảnh sản phẩm
              </span>
              <span className="text-[10px] tracking-[0.08em] text-[oklch(0.5_0.024_60)]">
                JPG / PNG / WEBP · tối đa 5MB
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
              // Reset input để có thể chọn cùng file lần nữa nếu cần
              e.target.value = ""
            }}
          />
        </label>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-[oklch(0.78_0.12_30/0.4)] bg-[oklch(0.96_0.04_30/0.4)] px-3 py-2 text-[11px] font-medium text-[oklch(0.45_0.12_30)]"
        >
          {error}
        </p>
      )}
    </div>
  )
}
