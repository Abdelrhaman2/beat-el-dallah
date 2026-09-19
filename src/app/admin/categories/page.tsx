"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminSelect, adminInsert, adminUpdate } from "@/lib/admin-api";
import { Category } from "@/types";
import { FolderTree, Plus, Edit2, CheckCircle, XCircle, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await adminSelect({ table: "categories", select: "*", orderBy: "sort_order", orderAsc: true });
      if (res.data) setCategories(res.data);
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const openNewCategory = () => {
    setIsNew(true);
    setNameAr("");
    setNameEn("");
    setSlug("");
    setImageUrl("/images/categories/dallah.webp");
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setEditingCategory({} as Category);
  };

  const openEditCategory = (cat: Category) => {
    setIsNew(false);
    setEditingCategory(cat);
    setNameAr(cat.name_ar);
    setNameEn(cat.name_en);
    setSlug(cat.slug);
    setImageUrl(cat.image_url || "");
    setSortOrder(cat.sort_order);
    setIsActive(cat.is_active);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        await adminInsert({
          table: "categories",
          data: {
            name_ar: nameAr,
            name_en: nameEn,
            slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
            image_url: imageUrl,
            sort_order: sortOrder,
            is_active: isActive,
          },
        });
      } else if (editingCategory?.id) {
        await adminUpdate({
          table: "categories",
          data: {
            name_ar: nameAr,
            name_en: nameEn,
            slug,
            image_url: imageUrl,
            sort_order: sortOrder,
            is_active: isActive,
          },
          match: { id: editingCategory.id },
        });
      }
      setEditingCategory(null);
      await loadCategories();
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-espresso">إدارة أقسام المتجر</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            التحكم في الأقسام الرئيسية الستة، ترتيب الظهور، والصور التعريفية
          </p>
        </div>

        <button
          onClick={openNewCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-xs shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="border-b border-brand-border bg-brand-cream/40 text-brand-muted font-bold">
              <th className="p-3.5">القسم</th>
              <th className="p-3.5">الاسم بالإنجليزية</th>
              <th className="p-3.5">الاسم التعريفي (Slug)</th>
              <th className="p-3.5">ترتيب العرض</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-brand-cream/20 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    {cat.image_url && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-cream flex-shrink-0 border">
                        <Image src={cat.image_url} alt={cat.name_ar} fill className="object-cover" />
                      </div>
                    )}
                    <strong className="font-bold text-brand-espresso">{cat.name_ar}</strong>
                  </div>
                </td>
                <td className="p-3.5 text-brand-muted font-semibold">{cat.name_en}</td>
                <td className="p-3.5 font-mono text-brand-muted">{cat.slug}</td>
                <td className="p-3.5 font-bold text-brand-espresso">{cat.sort_order}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      cat.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cat.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{cat.is_active ? "نشط" : "معطل"}</span>
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="p-1.5 rounded-lg bg-brand-cream hover:bg-brand-caramel hover:text-white text-brand-espresso transition-colors cursor-pointer"
                    title="تعديل القسم"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-black text-brand-espresso">
                {isNew ? "إضافة قسم جديد" : "تعديل القسم"}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-espresso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-espresso mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-espresso mb-1">الاسم بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-espresso mb-1">الاسم بالرابط (Slug) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none text-start"
                  dir="ltr"
                />
              </div>

              <ImageUpload
                label="صورة القسم"
                value={imageUrl}
                onChange={setImageUrl}
                folder="categories"
              />

              <div>
                <label className="block font-bold text-brand-espresso mb-1">ترتيب العرض</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-brand-caramel focus:ring-brand-caramel"
                />
                <label htmlFor="catActive" className="font-bold text-brand-espresso cursor-pointer">
                  تفعيل القسم بالمتجر
                </label>
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-brand-cream text-brand-espresso font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-caramel text-white font-bold hover:bg-brand-caramel/90"
                >
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
