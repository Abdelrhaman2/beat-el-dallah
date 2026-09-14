"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/utils";
import { MOCK_SITE_SETTINGS } from "@/lib/supabase/mock-data";
import { supabase } from "@/lib/supabase/client";
import { Order, SiteSettings } from "@/types";
import {
  CheckCircle2,
  MessageCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = use(params);
  const { t, isArabic, locale } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(MOCK_SITE_SETTINGS);
  const [copied, setCopied] = useState(false);
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function loadOrder() {
      try {
        const { data: orderData } = await supabase
          .from("orders")
          .select("*, items:order_items(*)")
          .eq("order_ref", orderRef)
          .single();

        if (orderData) setOrder(orderData);

        const { data: setts } = await supabase.from("site_settings").select("*").eq("id", 1).single();
        if (setts) setSettings(setts);
      } catch {
        // Continue
      }
    }
    loadOrder();
  }, [orderRef]);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReopenWhatsApp = () => {
    const msg = isArabic
      ? `مرحباً بيت الدلة، بخصوص الطلب رقم: ${orderRef}\nأود تأكيد الطلب وإرسال إيصال تحويل العربون.`
      : `Hello Beit El Dallah, regarding Order Ref: ${orderRef}\nI would like to confirm and provide deposit transfer receipt.`;

    const cleanNum = settings.whatsapp_number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10 text-center">
      {/* Celebration Icon */}
      <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600 mb-2 shadow-sm animate-bounce">
        <CheckCircle2 className="w-16 h-16" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-brand-espresso">
          {t.confirmationTitle}
        </h1>
        <p className="text-sm text-brand-muted max-w-lg mx-auto">
          {isArabic
            ? "تم تسجيل طلبك بنجاح في نظام بيت الدلة، وحفظ كافة التفاصيل للتجهيز السريع."
            : "Your order has been registered in our system and queued for immediate dispatch upon deposit receipt."}
        </p>
      </div>

      {/* Order Reference Badge Card */}
      <div className="bg-brand-surface rounded-3xl border-2 border-brand-caramel/30 p-6 sm:p-8 shadow-warm max-w-md mx-auto space-y-3">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
          {t.orderRef}
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-black text-brand-espresso tracking-wider font-mono">
            {orderRef}
          </span>
          <button
            onClick={handleCopyRef}
            className="p-2 rounded-xl bg-brand-cream hover:bg-brand-caramel hover:text-white text-brand-espresso transition-colors cursor-pointer"
            title="Copy reference"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-brand-caramel text-xs font-bold mt-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{isArabic ? "الحالة: قيد الانتظار (بانتظار تأكيد العربون)" : "Status: Pending Deposit Verification"}</span>
        </div>
      </div>

      {/* Action: Re-open WhatsApp */}
      <div className="space-y-3">
        <button
          onClick={handleReopenWhatsApp}
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t.reopenWhatsApp}</span>
        </button>
        <p className="text-xs text-brand-muted">
          {t.whatsappOpenedNotice}
        </p>
      </div>

      {/* What's Next Steps Guide */}
      <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 text-start space-y-4 shadow-sm">
        <h3 className="text-base font-black text-brand-espresso flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-caramel" />
          <span>{t.nextStepsTitle}</span>
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-brand-espresso leading-relaxed">
          <div className="p-3 rounded-xl bg-brand-cream/50 border border-brand-border flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-espresso text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p>{t.step1}</p>
          </div>

          <div className="p-3 rounded-xl bg-brand-cream/50 border border-brand-border flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-espresso text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p>{t.step2}</p>
          </div>

          <div className="p-3 rounded-xl bg-brand-cream/50 border border-brand-border flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-espresso text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              3
            </span>
            <p>{t.step3}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-brand-espresso font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-caramel flex-shrink-0" />
          <span>{t.screenshotNotice}</span>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-caramel transition-colors"
        >
          <span>{t.backToHome}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
