"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Product, Category, ProductVariant } from "@/types";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState<number>(150);
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from("categories").select("*").order("sort_order");
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .order("sort_order", { ascending: true });
      if (prodData) setProducts(prodData);
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openNewProduct = () => {
    setIsNew(true);
    setNameAr("");
    setNameEn("");
    setSlug("");
    setCategoryId(categories[0]?.id || "");
    setBasePrice(150);
    setDescAr("");
    setDescEn("");
    setImg1("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop");
    setImg2("");
    setIsActive(true);
    setEditingProduct({} as Product);
  };

  const openEditProduct = (prod: Product) => {
    setIsNew(false);
    setEditingProduct(prod);
    setNameAr(prod.name_ar);
    setNameEn(prod.name_en);
    setSlug(prod.slug);
    setCategoryId(prod.category_id);
    setBasePrice(prod.base_price);
    setDescAr(prod.short_description_ar || "");
    setDescEn(prod.short_description_en || "");
    setImg1(prod.image_url_1);
    setImg2(prod.image_url_2 || "");
    setIsActive(prod.is_active);
  };

  const handleToggleActive = async (productId: string, current: boolean) => {
    try {
      await supabase.from("products").update({ is_active: !current }).eq("id", productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !current } : p))
      );
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name_ar: nameAr,
            name_en: nameEn,
            slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
            category_id: categoryId,
            base_price: Number(basePrice),
            short_description_ar: descAr,
            short_description_en: descEn,
            image_url_1: img1,
            image_url_2: img2 || null,
            is_active: isActive,
          })
          .select()
          .single();

        if (error) throw error;
      } else if (editingProduct?.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name_ar: nameAr,
            name_en: nameEn,
            slug,
            category_id: categoryId,
            base_price: Number(basePrice),
            short_description_ar: descAr,
            short_description_en: descEn,
            image_url_1: img1,
            image_url_2: img2 || null,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      }

      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      alert("خطأ في حفظ المنتج: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-espresso">إدارة منتجات القهوة والتجهيزات</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            إضافة منتجات جديدة، تعديل الأسعار والأوصاف، والتحكم في توفر المنتجات بالمتجر
          </p>
        </div>

        <button
          onClick={openNewProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-xs shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted animate-pulse">
            جاري تحميل المنتجات...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-brand-border bg-brand-cream/40 text-brand-muted font-bold">
                  <th className="p-3.5">المنتج</th>
                  <th className="p-3.5">القسم</th>
                  <th className="p-3.5">السعر الأساسي</th>
                  <th className="p-3.5">الأوزان / المتغيرات</th>
                  <th className="p-3.5">حالة التوفر</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-cream/20 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-cream flex-shrink-0 border border-brand-border">
                          <Image src={prod.image_url_1} alt={prod.name_ar} fill className="object-cover" />
                        </div>
                        <div>
                          <strong className="font-bold text-brand-espresso block">{prod.name_ar}</strong>
                          <span className="text-[11px] text-brand-muted">{prod.name_en}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-brand-muted font-semibold">
                      {prod.category?.name_ar || "-"}
                    </td>
                    <td className="p-3.5 font-black text-brand-espresso">
                      {formatPrice(prod.base_price, "ar")}
                    </td>
                    <td className="p-3.5 text-brand-muted">
                      {prod.variants?.length || 0} متغيرات
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(prod.id, prod.is_active)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          prod.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {prod.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{prod.is_active ? "نشط بالمتجر" : "معطل"}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-brand-cream hover:bg-brand-caramel hover:text-white text-brand-espresso transition-colors cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-black text-brand-espresso">
                {isNew ? "إضافة منتج جديد" : "تعديل بيانات المنتج"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-espresso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-espresso mb-1">القسم *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-espresso mb-1">السعر الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                label="الصورة الرئيسية للمنتج (Image 1)"
                value={img1}
                onChange={setImg1}
                folder="products"
                required
              />

              <ImageUpload
                label="الصورة الثانية الإضافية (Image 2)"
                value={img2}
                onChange={setImg2}
                folder="products"
              />

              <div>
                <label className="block font-bold text-brand-espresso mb-1">وصف مختصر (عربي)</label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-brand-caramel focus:ring-brand-caramel"
                />
                <label htmlFor="activeCheck" className="font-bold text-brand-espresso cursor-pointer">
                  تفعيل المنتج وعرضه للعملاء في المتجر
                </label>
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-brand-cream text-brand-espresso font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-caramel text-white font-bold hover:bg-brand-caramel/90"
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
