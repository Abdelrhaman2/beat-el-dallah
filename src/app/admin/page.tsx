"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data } = await supabase
          .from("orders")
          .select("*, items:order_items(*)")
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) setOrders(data);
      } catch {
        // Continue
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-espresso">لوحة التحكم والمؤشرات</h1>
          <p className="text-xs text-brand-muted mt-1">
            نظرة عامة على نشاط متجر بيت الدلة، الطلبات اليومية، ومبيعات الحبوب ومستلزمات الكافيهات.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-caramel text-white text-xs font-bold hover:bg-brand-caramel/90 transition-all shadow-sm"
        >
          <span>عرض جميع الطلبات</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted">إجمالي الطلبات المسجلة</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-espresso">{orders.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">سجل نشط ومحدث</span>
        </div>

        {/* Pending Deposit Orders */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted">طلبات بانتظار تأكيد العربون</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <span className="text-[11px] text-brand-muted font-semibold block">تحتاج مراجعة إيصال واتساب</span>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted">طلبات مؤكدة وجاهزة للشحن</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{confirmedCount}</div>
          <span className="text-[11px] text-purple-700 font-semibold block">تم استلام العربون بنجاح</span>
        </div>

        {/* Total Order Value */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted">إجمالي قيمة الطلبات المسجلة</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-espresso">{formatPrice(totalRevenue, "ar")}</div>
          <span className="text-[11px] text-emerald-700 font-semibold block">وفقاً لسجلات النظام</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <h2 className="text-base font-bold text-brand-espresso">أحدث الطلبات الواردة</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-brand-caramel hover:underline">
            إدارة كافة الطلبات ←
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-brand-muted animate-pulse">
            جاري تحميل بيانات الطلبات...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-muted">
            لا توجد طلبات مسجلة حتى الآن. عند قيام أي عميل بطلب سيظهر هنا فوراً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-brand-border bg-brand-cream/40 text-brand-muted font-bold">
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">المحافظة</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3">العربون المطلوب</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">واتساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-espresso">
                      {order.order_ref}
                    </td>
                    <td className="p-3 font-semibold text-brand-espresso">
                      {order.customer_name}
                    </td>
                    <td className="p-3 font-mono text-brand-muted" dir="ltr">
                      {order.customer_phone}
                    </td>
                    <td className="p-3 text-brand-muted">{order.governorate}</td>
                    <td className="p-3 font-bold text-brand-espresso">
                      {formatPrice(order.subtotal, "ar")}
                    </td>
                    <td className="p-3 font-bold text-brand-caramel">
                      {formatPrice(order.deposit_amount, "ar")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status === "pending"
                          ? "قيد الانتظار"
                          : order.status === "confirmed"
                          ? "تم التأكيد"
                          : order.status === "shipped"
                          ? "جاري الشحن"
                          : order.status === "delivered"
                          ? "تم التوصيل"
                          : "ملغي"}
                      </span>
                    </td>
                    <td className="p-3">
                      <a
                        href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        title="محادثة العميل عبر واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
