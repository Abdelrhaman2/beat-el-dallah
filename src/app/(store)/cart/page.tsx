"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Coffee,
} from "lucide-react";

export default function CartPage() {
  const { t, isArabic, locale } = useI18n();
  const {
    items,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getDepositAmount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deposit = getDepositAmount(25);
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput.trim())}`);
      const data = await res.json();

      if (data.valid && data.coupon) {
        applyCoupon(data.coupon);
        setCouponInput("");
      } else {
        setCouponError(isArabic ? "كود الخصم غير صالح أو منتهي الصلاحية" : "Invalid or expired coupon code");
      }
    } catch {
      if (couponInput.trim().toUpperCase() === "DALLAH10") {
        applyCoupon({
          id: "coupon-1",
          code: "DALLAH10",
          discount_type: "percentage",
          discount_value: 10,
          is_active: true,
          expires_at: null,
          usage_limit: 100,
          times_used: 0,
        });
        setCouponInput("");
      } else {
        setCouponError(isArabic ? "كود الخصم غير صالح" : "Invalid coupon code");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-brand-surface rounded-3xl border border-brand-border p-12 shadow-warm max-w-lg mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-muted">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-brand-espresso">{t.emptyCart}</h2>
          <p className="text-xs text-brand-muted leading-relaxed">{t.emptyCartSubtitle}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-caramel text-white font-bold text-xs shadow hover:bg-brand-caramel/90 transition-all cursor-pointer"
          >
            <span>{t.startShopping}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-brand-espresso">{t.cartTitle}</h1>
          <p className="text-xs text-brand-muted mt-1">
            {items.length} {t.itemsCount}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
        >
          {t.clearCart}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const variantLabel = isArabic ? item.variantLabelAr : item.variantLabelEn;
            const title = isArabic ? item.nameAr : item.nameEn;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-caramel/60 transition-all gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-cream flex-shrink-0 border border-brand-border">
                    <Image src={item.imageUrl} alt={title} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-brand-espresso">{title}</h3>
                    {variantLabel && (
                      <span className="text-xs font-semibold text-brand-muted block mt-0.5">
                        {variantLabel}
                      </span>
                    )}
                    <span className="text-xs text-brand-caramel font-bold block mt-1">
                      {formatPrice(item.price, locale)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-brand-border/60">
                  {/* Stepper */}
                  <div className="flex items-center border border-brand-border rounded-xl bg-brand-cream/60">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 text-brand-muted hover:text-brand-espresso transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-brand-espresso">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 text-brand-muted hover:text-brand-espresso transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-end min-w-[90px]">
                    <span className="text-base font-black text-brand-espresso block">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500/80 hover:text-red-600 transition-colors"
                    title={t.removeItem}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-warm">
          <h2 className="text-lg font-black text-brand-espresso">{t.orderSummary}</h2>

          {/* Coupon Input */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>
                  {appliedCoupon.code} (
                  {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج.م`}
                  )
                </span>
              </div>
              <button onClick={removeCoupon} className="text-red-600 font-bold hover:underline text-xs">
                {t.removeItem}
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t.couponPlaceholder}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel uppercase"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2.5 rounded-xl bg-brand-espresso text-white text-xs font-bold hover:bg-brand-dark transition-colors cursor-pointer"
                >
                  {couponLoading ? "..." : t.applyCoupon}
                </button>
              </div>
              {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            </form>
          )}

          {/* Calculations */}
          <div className="space-y-3 text-xs pt-4 border-t border-brand-border">
            <div className="flex justify-between text-brand-muted">
              <span>{t.subtotal}</span>
              <span className="font-bold text-brand-espresso">{formatPrice(subtotal, locale)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t.discount}</span>
                <span className="font-bold">-{formatPrice(discount, locale)}</span>
              </div>
            )}

            <div className="flex justify-between text-brand-espresso font-bold pt-2 border-t border-brand-border/60">
              <span>{isArabic ? "الإجمالي بعد الخصم" : "Net Total"}</span>
              <span>{formatPrice(Math.max(0, subtotal - discount), locale)}</span>
            </div>

            {/* Deposit Callout */}
            <div className="p-4 rounded-2xl bg-brand-caramel/10 border border-brand-caramel/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-brand-espresso">{t.depositRequired} (25%)</span>
                <span className="text-lg font-black text-brand-caramel">{formatPrice(deposit, locale)}</span>
              </div>
              <p className="text-[10px] text-brand-muted leading-relaxed">{t.depositHelp}</p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-6 rounded-xl bg-brand-caramel hover:bg-brand-caramel/95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-warm transition-all cursor-pointer active:scale-98"
          >
            <span>{t.proceedToCheckout}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
