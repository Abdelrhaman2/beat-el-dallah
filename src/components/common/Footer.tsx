"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { useI18n } from "@/lib/i18n/context";
import { MessageCircle, Phone, MapPin, ShieldCheck, Truck, Clock } from "lucide-react";

export function Footer() {
  const { t, isArabic } = useI18n();

  return (
    <footer className="bg-brand-espresso text-amber-50/90 pt-16 pb-12 border-t-4 border-brand-caramel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="p-3 rounded-lg bg-brand-caramel/20 text-brand-gold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.badgeFreshRoast}</h4>
              <p className="text-xs text-amber-100/70">{isArabic ? "تحميص أسبوعي لحفظ النكهة والقوام" : "Weekly artisan roasting batches"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="p-3 rounded-lg bg-brand-caramel/20 text-brand-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.badgeFastShipping}</h4>
              <p className="text-xs text-amber-100/70">{isArabic ? "تغطية كاملة لـ 27 محافظة مصرية" : "Serving all 27 Egyptian governorates"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="p-3 rounded-lg bg-brand-caramel/20 text-brand-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.badgeDepositCheckout}</h4>
              <p className="text-xs text-amber-100/70">{isArabic ? "عربون ميسر عبر انستاباي وفودافون كاش" : "Direct deposit via InstaPay & Vodafone Cash"}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/95 p-3 rounded-xl inline-block shadow-md">
              <BrandLogo size="sm" />
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4">
              {t.categoriesTitle}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/categories/dallah-coffee" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "بن الدله العربي" : "Dallah Coffee"}
                </Link>
              </li>
              <li>
                <Link href="/categories/star-coffee" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "ستار كوفي" : "Star Coffee"}
                </Link>
              </li>
              <li>
                <Link href="/categories/espresso" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "حبوب الاسبريسو" : "Espresso Beans"}
                </Link>
              </li>
              <li>
                <Link href="/categories/turkish-coffee" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "بن تركي محوج وسادة" : "Turkish Coffee"}
                </Link>
              </li>
              <li>
                <Link href="/categories/tea" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "شاي سيلاني فاخر" : "Ceylon Tea"}
                </Link>
              </li>
              <li>
                <Link href="/categories/cafe-supplies" className="hover:text-brand-gold transition-colors">
                  {isArabic ? "مستلزمات ومعدات الكافيهات" : "Cafe Supplies & Gear"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4">
              {t.contactUs}
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a
                  href="https://wa.me/201012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 font-semibold"
                >
                  01012345678 (واتساب)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>{isArabic ? "القاهرة - جمهورية مصر العربية" : "Cairo - Arab Republic of Egypt"}</span>
              </li>
              <li className="pt-2 text-amber-200/70">
                {isArabic
                  ? "مواعيد الرد واستقبال الطلبات: يومياً من 9 صباحاً حتى 11 مساءً"
                  : "Customer care: Daily from 9:00 AM to 11:00 PM"}
              </li>
            </ul>
          </div>

          {/* Payment & Trust */}
          <div>
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4">
              {isArabic ? "طرق تحويل العربون" : "Deposit Methods"}
            </h3>
            <p className="text-xs text-amber-100/70 mb-3">
              {isArabic
                ? "يتم تأكيد الطلبات فور إرسال إيصال تحويل العربون عبر واتساب."
                : "Orders are dispatched promptly after receipt verification on WhatsApp."}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/40">
                Vodafone Cash
              </span>
              <span className="px-2.5 py-1 rounded bg-violet-600/30 text-violet-200 border border-violet-500/40">
                InstaPay (انستاباي)
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-600/30 text-emerald-200 border border-emerald-500/40">
                تحويل بنكي
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/50 gap-4">
          <p>© {new Date().getFullYear()} {t.allRightsReserved}.</p>
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-brand-gold transition-colors">
              {t.navOrders}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
