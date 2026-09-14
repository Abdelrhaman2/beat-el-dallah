"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const { t, isArabic, locale } = useI18n();
  const {
    items,
    appliedCoupon,
    isCartDrawerOpen,
    setCartDrawerOpen,
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

  if (!isCartDrawerOpen) return null;

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
      // Fallback local validation if offline
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <div className={`fixed inset-y-0 ${isArabic ? "left-0" : "right-0"} max-w-full flex pl-0`}>
        <div className="w-screen max-w-md bg-brand-surface shadow-2xl flex flex-col border-s border-brand-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-brand-cream/60">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-caramel" />
              <h2 className="text-lg font-bold text-brand-espresso">{t.cartTitle}</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-espresso text-white">
                {items.length}
              </span>
            </div>

            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-espresso hover:bg-brand-cream transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-muted">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-espresso">{t.emptyCart}</h3>
                  <p className="text-xs text-brand-muted mt-1">{t.emptyCartSubtitle}</p>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-caramel text-white text-xs font-bold hover:bg-brand-caramel/90 transition-all cursor-pointer shadow"
                >
                  {t.startShopping}
                </button>
              </div>
            ) : (
              items.map((item) => {
                const variantLabel = isArabic ? item.variantLabelAr : item.variantLabelEn;
                const title = isArabic ? item.nameAr : item.nameEn;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 rounded-xl border border-brand-border bg-brand-cream/30 hover:border-brand-caramel/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-brand-surface border border-brand-border">
                      <Image src={item.imageUrl} alt={title} fill className="object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-brand-espresso line-clamp-1">{title}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500/70 hover:text-red-600 p-1"
                            title={t.removeItem}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {variantLabel && (
                          <span className="text-[11px] font-semibold text-brand-muted block mt-0.5">
                            {variantLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-brand-border rounded-lg bg-brand-surface">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-brand-muted hover:text-brand-espresso"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-brand-espresso">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-brand-muted hover:text-brand-espresso"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-black text-brand-espresso">
                          {formatPrice(item.price * item.quantity, locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer (Calculations & Checkout) */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-border bg-brand-cream/40 space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isArabic ? "تم تطبيق كود" : "Coupon Applied"}: <strong>{appliedCoupon.code}</strong> (
                      {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج.م`}
                      )
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs font-bold">
                    {t.removeItem}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t.couponPlaceholder}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-surface focus:outline-none focus:border-brand-caramel uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-brand-espresso text-white text-xs font-bold hover:bg-brand-dark transition-colors cursor-pointer"
                  >
                    {couponLoading ? "..." : t.applyCoupon}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-2">
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

                {/* Deposit Requirement Card */}
                <div className="p-3 rounded-xl bg-brand-caramel/10 border border-brand-caramel/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-espresso">
                    <ShieldCheck className="w-4 h-4 text-brand-caramel flex-shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">{t.depositRequired} (25%)</span>
                      <span className="text-[10px] text-brand-muted">{t.depositHelp}</span>
                    </div>
                  </div>
                  <span className="text-base font-black text-brand-caramel">
                    {formatPrice(deposit, locale)}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <Link
                href="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-caramel hover:bg-brand-caramel/95 text-white font-bold text-sm shadow-warm transition-all cursor-pointer active:scale-98"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
