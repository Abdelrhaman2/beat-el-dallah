"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types";
import { BarChart3, Download, TrendingUp, ShoppingBag, MapPin, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportsData() {
      try {
        const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (data) setOrders(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadReportsData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const totalDeposit = orders.reduce((sum, o) => sum + Number(o.deposit_amount || 0), 0);

  // Group by status
  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // Group by governorate
  const govCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.governorate] = (acc[o.governorate] || 0) + 1;
    return acc;
  }, {});

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("لا توجد بيانات طلبات لتصديرها.");
      return;
    }

    const headers = [
      "Order Reference",
      "Created At",
      "Customer Name",
      "Customer Phone",
      "Governorate",
      "Address",
      "Subtotal (EGP)",
      "Deposit %",
      "Deposit Amount (EGP)",
      "Status",
      "Coupon",
    ];

    const rows = orders.map((o) => [
      `"${o.order_ref}"`,
      `"${new Date(o.created_at).toISOString()}"`,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.governorate}"`,
      `"${o.address_details.replace(/"/g, '""')}"`,
      o.subtotal,
      o.deposit_percentage,
      o.deposit_amount,
      `"${o.status}"`,
      `"${o.coupon_code || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `beit-el-dallah-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-espresso">التقارير والمبيعات</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            تحليل حركة الطلبات والإيرادات وتوزيع المحافظات الجغرافية
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
        >
          <Download className="w-4 h-4" />
          <span>تصدير الطلبات (CSV)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <span className="text-xs font-bold text-brand-muted">إجمالي قيمة الطلبات المسجلة</span>
          <div className="text-2xl font-black text-brand-espresso">{formatPrice(totalRevenue, "ar")}</div>
          <span className="text-[11px] text-emerald-700 font-semibold block">لكافة الطلبات</span>
        </div>

        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <span className="text-xs font-bold text-brand-muted">إجمالي العربون المستحق</span>
          <div className="text-2xl font-black text-brand-caramel">{formatPrice(totalDeposit, "ar")}</div>
          <span className="text-[11px] text-brand-muted font-semibold block">عربون التأكيد (25%)</span>
        </div>

        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-sm space-y-2">
          <span className="text-xs font-bold text-brand-muted">عدد الطلبات المسجلة</span>
          <div className="text-2xl font-black text-brand-espresso">{orders.length} طلب</div>
          <span className="text-[11px] text-brand-muted font-semibold block">عبر المتجر الإلكتروني</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="text-sm font-black text-brand-espresso flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-caramel" />
            <span>توزيع الطلبات حسب الحالة</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {[
              { id: "pending", label: "قيد الانتظار (بانتظار العربون)", color: "bg-amber-500" },
              { id: "confirmed", label: "تم التأكيد", color: "bg-blue-500" },
              { id: "shipped", label: "جاري الشحن", color: "bg-purple-500" },
              { id: "delivered", label: "تم التوصيل", color: "bg-emerald-500" },
              { id: "cancelled", label: "ملغي", color: "bg-red-500" },
            ].map((st) => {
              const count = statusCounts[st.id] || 0;
              const percent = orders.length > 0 ? ((count / orders.length) * 100).toFixed(0) : 0;
              return (
                <div key={st.id} className="space-y-1">
                  <div className="flex justify-between font-semibold text-brand-espresso">
                    <span>{st.label}</span>
                    <span>{count} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-brand-cream overflow-hidden">
                    <div className={`h-full ${st.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Governorates */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="text-sm font-black text-brand-espresso flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-caramel" />
            <span>أكثر المحافظات طلباً</span>
          </h3>

          <div className="space-y-2 text-xs">
            {Object.entries(govCounts).length === 0 ? (
              <p className="text-brand-muted text-center py-6">لا توجد بيانات كافية بعد.</p>
            ) : (
              Object.entries(govCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([gov, count], idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-brand-cream/40">
                    <span className="font-bold text-brand-espresso">{gov}</span>
                    <span className="font-mono font-bold text-brand-caramel">{count} طلب</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
