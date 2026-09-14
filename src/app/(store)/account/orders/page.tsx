"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/types";
import { Package, Search, Clock, CheckCircle, Truck, XCircle, Coffee } from "lucide-react";

export default function CustomerOrdersPage() {
  const { t, isArabic, locale } = useI18n();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const { data } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .ilike("customer_phone", `%${phone.trim()}%`)
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" />
            <span>{t.statusPending} (بانتظار العربون)</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle className="w-3 h-3" />
            <span>{t.statusConfirmed}</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Truck className="w-3 h-3" />
            <span>{t.statusShipped}</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" />
            <span>{t.statusDelivered}</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3" />
            <span>{t.statusCancelled}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-brand-espresso">{t.navOrders}</h1>
        <p className="text-xs sm:text-sm text-brand-muted">
          {isArabic
            ? "أدخل رقم هاتفك المستخدم في الطلب لمتابعة حالة الشحن وتفاصيل طلباتك"
            : "Enter your phone number to check order status and dispatch updates"}
        </p>
      </div>

      {/* Phone Lookup Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.phonePlaceholder}
          dir="ltr"
          className="flex-1 px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-surface focus:outline-none focus:border-brand-caramel shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-brand-caramel text-white font-bold text-xs flex items-center gap-1.5 hover:bg-brand-caramel/90 transition-all cursor-pointer shadow"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "..." : isArabic ? "بحث" : "Search"}</span>
        </button>
      </form>

      {/* Orders List */}
      {searched && (
        <div className="space-y-4 pt-4">
          {orders.length === 0 ? (
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-8 text-center space-y-2">
              <Package className="w-10 h-10 text-brand-muted mx-auto" />
              <p className="text-xs font-bold text-brand-espresso">
                {isArabic ? "لم يتم العثور على طلبات مسجلة بهذا الرقم" : "No orders found for this phone number"}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-warm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
                  <div>
                    <span className="text-xs text-brand-muted block">{t.orderRef}</span>
                    <span className="text-lg font-black text-brand-espresso font-mono">
                      {order.order_ref}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-brand-muted block">{isArabic ? "تاريخ الطلب" : "Order Date"}</span>
                    <span className="font-bold text-brand-espresso">
                      {new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-muted block">{t.governorate}</span>
                    <span className="font-bold text-brand-espresso">{order.governorate}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted block">{t.subtotal}</span>
                    <span className="font-bold text-brand-espresso">{formatPrice(order.subtotal, locale)}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted block">{t.depositRequired}</span>
                    <span className="font-bold text-brand-caramel">{formatPrice(order.deposit_amount, locale)}</span>
                  </div>
                </div>

                {/* Items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="pt-2 border-t border-brand-border/60 text-xs space-y-1">
                    <span className="font-bold text-brand-espresso block mb-1">
                      {isArabic ? "المنتجات:" : "Items:"}
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-brand-muted">
                        <span>
                          {item.name_snapshot} {item.variant_snapshot ? `(${item.variant_snapshot})` : ""} × {item.quantity}
                        </span>
                        <span className="font-bold text-brand-espresso">{formatPrice(item.line_total, locale)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
