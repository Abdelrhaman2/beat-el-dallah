"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon, Check } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "products" | "categories" | "logo";
  label?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "products",
  label = "صورة المنتج",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const cleanName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("store-media")
        .upload(cleanName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("store-media")
        .getPublicUrl(cleanName);

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError("حدث خطأ أثناء رفع الصورة: " + (err.message || "تأكد من الاتصال بسوبابيز"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-brand-espresso">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-brand-caramel hover:underline font-semibold"
        >
          {showUrlInput ? "إخفاء إدخال الرابط اليدوي" : "أو إدخال رابط خارجي يدوي"}
        </button>
      </div>

      {/* Upload Zone / Preview */}
      <div className="flex items-start gap-4">
        {/* Preview Box */}
        {value ? (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-brand-caramel bg-brand-cream/40 flex-shrink-0 shadow-sm group">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="96px"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 end-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow"
              title="حذف الصورة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-caramel bg-brand-cream/30 flex flex-col items-center justify-center text-brand-muted hover:text-brand-espresso transition-all cursor-pointer flex-shrink-0"
          >
            <ImageIcon className="w-6 h-6 mb-1 opacity-60" />
            <span className="text-[10px] font-bold">معاينة</span>
          </div>
        )}

        {/* Upload Action */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              uploading
                ? "border-brand-caramel bg-brand-caramel/5 cursor-wait"
                : "border-brand-border hover:border-brand-caramel bg-brand-surface hover:bg-brand-cream/20"
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-caramel">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري رفع الصورة إلى سوبابيز (Supabase Storage)...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-brand-caramel" />
                <span className="text-xs font-bold text-brand-espresso">
                  اضغط هنا لاختيار صورة من جهازك (كمبيوتر / موبايل)
                </span>
                <span className="text-[11px] text-brand-muted">
                  PNG, JPG, WEBP حتى 5 ميجابايت (تُرفع وتُحفظ تلقائياً في سوبابيز)
                </span>
              </div>
            )}
          </div>

          {/* Manual URL Input fallback */}
          {showUrlInput && (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... رابط الصورة المباشر"
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel font-mono text-start"
              dir="ltr"
            />
          )}

          {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
}
