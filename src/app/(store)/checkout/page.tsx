"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice, isValidEgyptianPhone } from "@/lib/utils";
import { EGYPTIAN_GOVERNORATES } from "@/lib/data/governorates";
import { MOCK_SITE_SETTINGS } from "@/lib/supabase/mock-data";
import { SiteSettings } from "@/types";
import { supabase } from "@/lib/supabase/client";
import {
  MessageCircle,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  FileText,
  Copy,
  Check,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, isArabic, locale } = useI18n();
  const { items, appliedCoupon, getSubtotal, getDiscountAmount, getDepositAmount, clearCart } = useCartStore();

  const [settings, setSettings] = useState<SiteSettings>(MOCK_SITE_SETTINGS);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    governorate: "القاهرة (Cairo)",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const depositPercent = settings.deposit_percentage || 25;
  const deposit = getDepositAmount(depositPercent);
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
        if (data) setSettings(data);
      } catch {
        // Fallback
      }
    }
    loadSettings();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = isArabic ? "يرجى إدخال الاسم ثلاثي بالكامل" : "Please enter your full name (at least 3 characters)";
    }
    if (!formData.phone.trim() || !isValidEgyptianPhone(formData.phone)) {
      errs.phone = isArabic
        ? "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)"
        : "Please enter a valid Egyptian mobile number (e.g. 01012345678)";
    }
    if (!formData.governorate) {
      errs.governorate = isArabic ? "يرجى اختيار المحافظة" : "Please select your governorate";
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = isArabic ? "يرجى إدخال العنوان بالتفصيل" : "Please provide detailed street and building address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);

    try {
      // 1. Submit order to server-side API (which uses service_role key to insert safely as per Amendment #1)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name.trim(),
          customerPhone: formData.phone.trim(),
          governorate: formData.governorate,
          addressDetails: formData.address.trim(),
          notes: formData.notes.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || null,
            nameSnapshot: isArabic ? i.nameAr : i.nameEn,
            variantSnapshot: isArabic ? i.variantLabelAr || null : i.variantLabelEn || null,
            unitPrice: i.price,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon?.code || null,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Clear user cart
      clearCart();

      // 3. Open WhatsApp handoff URL in new tab
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }

      // 4. Redirect to order confirmation page
      router.push(`/order-confirmation/${data.orderRef}`);
    } catch (err: any) {
      alert(isArabic ? `حدث خطأ أثناء حفظ الطلب: ${err.message}` : `Error processing order: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-brand-surface rounded-3xl border border-brand-border p-12 max-w-md mx-auto space-y-4">
          <ShoppingBag className="w-12 h-12 text-brand-muted mx-auto" />
          <h2 className="text-xl font-bold text-brand-espresso">{t.emptyCart}</h2>
          <p className="text-xs text-brand-muted">{t.emptyCartSubtitle}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-caramel text-white text-xs font-bold"
          >
            <span>{t.startShopping}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-3xl font-black text-brand-espresso">{t.checkoutTitle}</h1>
        <p className="text-xs text-brand-muted mt-1">
          {isArabic ? "تسجيل الطلب والتحويل الميسر للعربون عبر واتساب" : "Order submission and easy deposit via WhatsApp"}
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Customer Information Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 space-y-5 shadow-warm">
            <h2 className="text-lg font-black text-brand-espresso flex items-center gap-2">
              <User className="w-5 h-5 text-brand-caramel" />
              <span>{t.customerInfo}</span>
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-brand-espresso mb-1.5">
                {t.fullName} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.fullNamePlaceholder}
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-brand-cream/30 focus:outline-none transition-colors ${
                  errors.name ? "border-red-500 focus:border-red-600" : "border-brand-border focus:border-brand-caramel"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-brand-espresso mb-1.5 flex items-center justify-between">
                <span>{t.phone} *</span>
                <span className="text-[10px] text-brand-muted">{t.phoneHelp}</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t.phonePlaceholder}
                  dir="ltr"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-brand-cream/30 focus:outline-none transition-colors ${
                    errors.phone ? "border-red-500 focus:border-red-600" : "border-brand-border focus:border-brand-caramel"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Governorate (27 Egyptian Governorates) */}
            <div>
              <label className="block text-xs font-bold text-brand-espresso mb-1.5">
                {t.governorate} *
              </label>
              <select
                value={formData.governorate}
                onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel cursor-pointer"
              >
                {EGYPTIAN_GOVERNORATES.map((gov) => (
                  <option key={gov.id} value={`${gov.name_ar} (${gov.name_en})`}>
                    {isArabic ? gov.name_ar : `${gov.name_en} (${gov.name_ar})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-xs font-bold text-brand-espresso mb-1.5">
                {t.address} *
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t.addressPlaceholder}
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-brand-cream/30 focus:outline-none transition-colors ${
                  errors.address ? "border-red-500 focus:border-red-600" : "border-brand-border focus:border-brand-caramel"
                }`}
              />
              {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-brand-espresso mb-1.5">
                {t.notes}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.notesPlaceholder}
                className="w-full px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel"
              />
            </div>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 space-y-4 shadow-warm">
            <h3 className="text-base font-black text-brand-espresso flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-caramel" />
              <span>{t.paymentMethodsTitle}</span>
            </h3>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-brand-espresso leading-relaxed whitespace-pre-line font-medium">
              {isArabic ? settings.payment_instructions_ar : settings.payment_instructions_en}
            </div>

            {/* Quick Copy Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy("01012345678", "vodafone")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border text-xs font-bold text-brand-espresso hover:border-brand-caramel transition-all cursor-pointer"
              >
                {copiedKey === "vodafone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "vodafone" ? t.copied : "نسخ فودافون كاش: 01012345678"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy("beit.eldallah@instapay", "instapay")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border text-xs font-bold text-brand-espresso hover:border-brand-caramel transition-all cursor-pointer"
              >
                {copiedKey === "instapay" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "instapay" ? t.copied : "نسخ انستاباي: beit.eldallah@instapay"}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p>{t.screenshotNotice}</p>
            </div>
          </div>
        </div>

        {/* Order Summary & WhatsApp Action Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-warm">
            <h2 className="text-lg font-black text-brand-espresso">{t.orderSummary}</h2>

            {/* Line Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-brand-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-brand-cream text-brand-espresso font-bold flex items-center justify-center flex-shrink-0">
                      {item.quantity}×
                    </span>
                    <div>
                      <span className="font-bold text-brand-espresso block">
                        {isArabic ? item.nameAr : item.nameEn}
                      </span>
                      {(item.variantLabelAr || item.variantLabelEn) && (
                        <span className="text-[10px] text-brand-muted">
                          {isArabic ? item.variantLabelAr : item.variantLabelEn}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-brand-espresso">
                    {formatPrice(item.price * item.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs pt-3 border-t border-brand-border">
              <div className="flex justify-between text-brand-muted">
                <span>{t.subtotal}</span>
                <span className="font-bold text-brand-espresso">{formatPrice(subtotal, locale)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>{t.discount} ({appliedCoupon?.code})</span>
                  <span className="font-bold">-{formatPrice(discount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-espresso font-bold pt-2 border-t border-brand-border/60">
                <span>{isArabic ? "الإجمالي الكلي" : "Grand Total"}</span>
                <span className="text-base">{formatPrice(Math.max(0, subtotal - discount), locale)}</span>
              </div>

              {/* Deposit Required Highlight */}
              <div className="p-4 rounded-2xl bg-brand-caramel/15 border border-brand-caramel/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-brand-espresso">
                    {t.depositRequired} ({depositPercent}%)
                  </span>
                  <span className="text-xl font-black text-brand-caramel">
                    {formatPrice(deposit, locale)}
                  </span>
                </div>
                <p className="text-[10px] text-brand-muted leading-relaxed">
                  {t.depositHelp}
                </p>
              </div>
            </div>

            {/* WhatsApp Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {submitting
                  ? isArabic ? "جاري تجهيز الطلب..." : "Preparing order..."
                  : t.whatsappCheckoutBtn}
              </span>
            </button>

            <p className="text-[10px] text-brand-muted text-center leading-relaxed">
              {isArabic
                ? "بالضغط على تأكيد، يتم حفظ طلبك بالنظام أولاً ثم تحويلك لواتساب للتواصل مع خدمة العملاء."
                : "Your order is securely registered in our system before opening WhatsApp."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
