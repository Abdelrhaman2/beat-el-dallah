"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MOCK_SITE_SETTINGS } from "@/lib/supabase/mock-data";
import { SiteSettings } from "@/types";
import { Settings, Save, Check, Phone, ShieldCheck, Percent } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(MOCK_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
        if (data) setSettings(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          deposit_percentage: Number(settings.deposit_percentage),
          whatsapp_number: settings.whatsapp_number.trim(),
          store_name_ar: settings.store_name_ar,
          store_name_en: settings.store_name_en,
          logo_url: settings.logo_url,
          payment_instructions_ar: settings.payment_instructions_ar,
          payment_instructions_en: settings.payment_instructions_en,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("خطأ في حفظ الإعدادات: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-brand-espresso">إعدادات المتجر والدفع</h1>
        <p className="text-xs text-brand-muted mt-0.5">
          التحكم في نسبة العربون الافتراضية، رقم الواتساب المستقبل للطلبات، وتعليمات التحويل
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإعدادات بنجاح! تم تطبيق النسبة ورقم الواتساب الجديد فوراً.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Deposit Percentage & WhatsApp Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-caramel" />
              <span>نسبة العربون المطلوبة للتأكيد (%) *</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              required
              value={settings.deposit_percentage}
              onChange={(e) =>
                setSettings({ ...settings, deposit_percentage: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel font-bold"
            />
            <p className="text-[11px] text-brand-muted mt-1">
              يتم احتساب العربون تلقائياً كنسبة من إجمالي السلة عند إتمام الطلب (الافتراضي 25%).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>رقم واتساب المتجر لاستقبال الطلبات *</span>
            </label>
            <input
              type="text"
              required
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="مثال: 201012345678"
              dir="ltr"
              className="w-full px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel font-mono"
            />
            <p className="text-[11px] text-brand-muted mt-1">
              بالصيغة الدولية مع كود مصر (20)، بدون مسافات أو رموز (+).
            </p>
          </div>
        </div>

        {/* Store Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-brand-border">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">
              اسم المتجر بالعربية
            </label>
            <input
              type="text"
              value={settings.store_name_ar}
              onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">
              اسم المتجر بالإنجليزية
            </label>
            <input
              type="text"
              value={settings.store_name_en}
              onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none text-start"
              dir="ltr"
            />
          </div>
        </div>

        {/* Store Logo */}
        <div className="pt-3 border-t border-brand-border">
          <ImageUpload
            label="شعار المتجر (Store Logo)"
            value={settings.logo_url || ""}
            onChange={(url) => setSettings({ ...settings, logo_url: url })}
            folder="logo"
          />
        </div>

        {/* Payment instructions */}
        <div className="space-y-4 pt-3 border-t border-brand-border">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">
              تعليمات تحويل العربون (عربي) — تظهر بصفحة الدفع ورسالة الواتساب
            </label>
            <textarea
              rows={4}
              value={settings.payment_instructions_ar}
              onChange={(e) =>
                setSettings({ ...settings, payment_instructions_ar: e.target.value })
              }
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none leading-relaxed font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">
              Payment Instructions (English)
            </label>
            <textarea
              rows={4}
              value={settings.payment_instructions_en}
              onChange={(e) =>
                setSettings({ ...settings, payment_instructions_en: e.target.value })
              }
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none leading-relaxed font-medium text-start"
              dir="ltr"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-xs flex items-center gap-2 shadow transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
