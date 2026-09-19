"use client";

import { useEffect, useState, useCallback } from "react";
import { adminSelect, adminUpdate } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import {
  ShoppingBag,
  Search,
  Filter,
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const PAGE_SIZE = 25; // Amendment #4: Real server-side pagination 25 per page

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Fetch orders with server-side filtering & pagination (Amendment #4)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const params: any = {
        table: "orders",
        select: "*, items:order_items(*)",
        orderBy: "created_at",
        orderAsc: false,
        rangeFrom: from,
        rangeTo: to,
        count: "exact" as const,
      };

      if (statusFilter !== "all") {
        params.filterCol = "status";
        params.filterVal = statusFilter;
      }

      if (searchQuery.trim()) {
        params.or = `order_ref.ilike.%${searchQuery.trim()}%,customer_phone.ilike.%${searchQuery.trim()}%,customer_name.ilike.%${searchQuery.trim()}%`;
      }

      const res = await adminSelect(params);

      if (res.data) {
        setOrders(res.data);
        setTotalCount(res.count || res.data.length);
      }
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(orderId);
    try {
      await adminUpdate({
        table: "orders",
        data: { status: newStatus, updated_at: new Date().toISOString() },
        match: { id: orderId },
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء تعديل الحالة: " + err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-espresso">إدارة ومتابعة الطلبات</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            تصفية الطلبات، مراجعة إيصالات العربون، وتحديث حالات الشحن (صفحة {currentPage} من {totalPages})
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث برقم الطلب، الهاتف، أو الاسم..."
            className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-cream/40 focus:outline-none focus:border-brand-caramel"
          />
          <Search className="w-4 h-4 text-brand-muted absolute start-3 top-2.5" />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
          {[
            { id: "all", label: "الكل" },
            { id: "pending", label: "قيد الانتظار" },
            { id: "confirmed", label: "تم التأكيد" },
            { id: "shipped", label: "جاري الشحن" },
            { id: "delivered", label: "تم التوصيل" },
            { id: "cancelled", label: "ملغي" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-brand-espresso text-white shadow-sm"
                  : "bg-brand-cream/60 text-brand-muted hover:bg-brand-cream hover:text-brand-espresso"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted animate-pulse">
            جاري تحميل وتصفية الطلبات من قاعدة البيانات...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            لا توجد طلبات مطابقة للبحث أو التصفية الحالية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-brand-border bg-brand-cream/40 text-brand-muted font-bold">
                  <th className="p-3.5">رقم الطلب</th>
                  <th className="p-3.5">تاريخ الطلب</th>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">المحافظة</th>
                  <th className="p-3.5">الإجمالي</th>
                  <th className="p-3.5">العربون</th>
                  <th className="p-3.5">حالة الطلب</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-cream/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-brand-espresso">
                      {order.order_ref}
                    </td>
                    <td className="p-3.5 text-brand-muted">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3.5 font-semibold text-brand-espresso">
                      {order.customer_name}
                    </td>
                    <td className="p-3.5 font-mono text-brand-muted" dir="ltr">
                      {order.customer_phone}
                    </td>
                    <td className="p-3.5 text-brand-muted">{order.governorate}</td>
                    <td className="p-3.5 font-bold text-brand-espresso">
                      {formatPrice(order.subtotal, "ar")}
                    </td>
                    <td className="p-3.5 font-bold text-brand-caramel">
                      {formatPrice(order.deposit_amount, "ar")}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={order.status}
                        disabled={statusUpdating === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          order.status === "pending"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : order.status === "confirmed"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : order.status === "shipped"
                            ? "bg-purple-50 text-purple-800 border-purple-300"
                            : order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-red-50 text-red-800 border-red-300"
                        }`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">تم التأكيد</option>
                        <option value="shipped">جاري الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-brand-cream hover:bg-brand-caramel hover:text-white text-brand-espresso transition-colors cursor-pointer"
                          title="عرض تفاصيل الطلب"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                          title="محادثة العميل عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
            <span>
              إجمالي {totalCount} طلب مسجل
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 rounded-lg border border-brand-border bg-brand-surface disabled:opacity-40 cursor-pointer font-bold"
              >
                السابق
              </button>
              <span className="font-bold text-brand-espresso">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 rounded-lg border border-brand-border bg-brand-surface disabled:opacity-40 cursor-pointer font-bold"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[11px] text-brand-muted block">تفاصيل الطلب</span>
                <h3 className="text-lg font-black text-brand-espresso font-mono">
                  {selectedOrder.order_ref}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-espresso hover:bg-brand-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-brand-cream/40 p-3.5 rounded-xl border border-brand-border">
              <div>
                <span className="text-brand-muted block">الاسم:</span>
                <strong className="text-brand-espresso">{selectedOrder.customer_name}</strong>
              </div>
              <div>
                <span className="text-brand-muted block">الهاتف:</span>
                <strong className="text-brand-espresso" dir="ltr">{selectedOrder.customer_phone}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-brand-muted block">العنوان:</span>
                <strong className="text-brand-espresso">{selectedOrder.address_details} ({selectedOrder.governorate})</strong>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-espresso">المنتجات المطلوبة:</h4>
              <div className="space-y-1.5 border border-brand-border rounded-xl p-3 bg-brand-surface">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-brand-border/40 last:border-0">
                    <div>
                      <span className="font-semibold text-brand-espresso">{item.name_snapshot}</span>
                      {item.variant_snapshot && (
                        <span className="text-[10px] text-brand-muted block">({item.variant_snapshot})</span>
                      )}
                    </div>
                    <div className="text-end">
                      <span className="text-brand-muted">{item.quantity} × {item.unit_price} = </span>
                      <strong className="text-brand-espresso">{formatPrice(item.line_total, "ar")}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-brand-border">
              <div className="flex justify-between text-brand-muted">
                <span>الإجمالي:</span>
                <span className="font-bold text-brand-espresso">{formatPrice(selectedOrder.subtotal, "ar")}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>الخصم ({selectedOrder.coupon_code}):</span>
                  <span>-{formatPrice(selectedOrder.discount_amount, "ar")}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-caramel font-black text-sm pt-1 border-t border-brand-border/60">
                <span>العربون المطلوب ({selectedOrder.deposit_percentage}%):</span>
                <span>{formatPrice(selectedOrder.deposit_amount, "ar")}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة العميل عبر واتساب</span>
              </a>

              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-4 rounded-xl bg-brand-cream text-brand-espresso font-bold text-xs hover:bg-brand-border"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
