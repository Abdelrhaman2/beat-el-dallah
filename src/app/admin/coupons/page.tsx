"use client";

import { useEffect, useState } from "react";
import { adminSelect, adminInsert, adminUpdate } from "@/lib/admin-api";
import { Coupon } from "@/types";
import { Tag, Plus, Trash2, CheckCircle, XCircle, X } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(10);
  const [limit, setLimit] = useState(100);

  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await adminSelect({ table: "coupons", select: "*", orderBy: "created_at", orderAsc: false });
      if (res.data) setCoupons(res.data);
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminInsert({
        table: "coupons",
        data: {
          code: code.trim().toUpperCase(),
          discount_type: type,
          discount_value: Number(value),
          usage_limit: limit,
          is_active: true,
        },
      });
      setShowNewModal(false);
      setCode("");
      await loadCoupons();
    } catch (err: any) {
      alert("خطأ: " + err.message);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await adminUpdate({
        table: "coupons",
        data: { is_active: !current },
        match: { id },
      });
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-espresso">إدارة كوبونات الخصم</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            إنشاء أكواد خصم ترويجية (نسبة مئوية أو خصم ثابت بالجنيه) ومتابعة معدل استخدامها
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-xs shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء كود خصم جديد</span>
        </button>
      </div>

      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="border-b border-brand-border bg-brand-cream/40 text-brand-muted font-bold">
              <th className="p-3.5">الكود</th>
              <th className="p-3.5">نوع الخصم</th>
              <th className="p-3.5">قيمة الخصم</th>
              <th className="p-3.5">مرات الاستخدام</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">التحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-brand-cream/20 transition-colors">
                <td className="p-3.5 font-mono font-black text-brand-espresso uppercase">
                  {c.code}
                </td>
                <td className="p-3.5 text-brand-muted font-semibold">
                  {c.discount_type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
                </td>
                <td className="p-3.5 font-black text-emerald-700">
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `${c.discount_value} ج.م`}
                </td>
                <td className="p-3.5 text-brand-espresso font-bold">
                  {c.times_used || 0} / {c.usage_limit || "غير محدود"}
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{c.is_active ? "مفعل" : "معطل"}</span>
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => handleToggleActive(c.id, c.is_active)}
                    className="text-xs font-bold text-brand-caramel hover:underline cursor-pointer"
                  >
                    {c.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-black text-brand-espresso">إنشاء كود خصم جديد</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg text-brand-muted hover:text-brand-espresso">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-espresso mb-1">كود الخصم *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: DALLAH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-espresso mb-1">نوع الخصم</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ج.م)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-espresso mb-1">قيمة الخصم *</label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-espresso mb-1">الحد الأقصى للاستخدام</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-cream text-brand-espresso font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-caramel text-white font-bold hover:bg-brand-caramel/90"
                >
                  إنشاء الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
