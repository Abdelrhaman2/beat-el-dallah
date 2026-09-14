import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/supabase/mock-data";
import { Category, Product } from "@/types";
import { Coffee, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 24; // Amendment #4: Explicit pagination size ~20-24

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const supabase = createServerSupabaseClient();

  // 1. Fetch category info
  let category: Category | null = null;
  try {
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (catData) category = catData;
  } catch {
    // Fallback
  }

  if (!category) {
    category = MOCK_CATEGORIES.find((c) => c.slug === slug) || null;
  }

  if (!category) {
    notFound();
  }

  // 2. Fetch paginated products with count
  let products: Product[] = [];
  let totalCount = 0;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  try {
    const { data: prodData, count } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)", { count: "exact" })
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .range(from, to);

    if (prodData && prodData.length > 0) {
      products = prodData;
      totalCount = count || prodData.length;
    }
  } catch {
    // Fallback mock
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS.filter((p) => p.category_id === category?.id);
    totalCount = products.length;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-brand-espresso text-white p-8 sm:p-12 shadow-warm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-caramel/20 text-brand-gold text-xs font-bold">
            <Coffee className="w-3.5 h-3.5" />
            <span>قسم معتمد</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {category.name_ar}
          </h1>
          <p className="text-sm sm:text-base text-amber-100/80">
            {category.name_en} — أفضل حبوب البن والتجهيزات المنتقاة بعناية لنكهة لا تضاهى.
          </p>

          <div className="text-xs text-amber-200/70 pt-2">
            إجمالي المنتجات المتاحة: <strong>{totalCount}</strong> منتج
          </div>
        </div>

        {/* Decorative background image */}
        {category.image_url && (
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <Image
              src={category.image_url}
              alt={category.name_ar}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-muted">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-brand-espresso">لا توجد منتجات في هذا القسم حالياً</h3>
          <p className="text-xs text-brand-muted">سيتم إضافة تشكيلات جديدة قريباً، تصفح باقي أقسام المتجر.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-caramel text-white text-xs font-bold hover:bg-brand-caramel/90 transition-all shadow"
          >
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls (Amendment #4) */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-brand-border flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/categories/${slug}?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-espresso hover:border-brand-caramel transition-colors"
            >
              الصفحة السابقة
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-brand-cream text-xs font-bold text-brand-muted/50 cursor-not-allowed">
              الصفحة السابقة
            </span>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-brand-espresso px-3">
            <span>{currentPage}</span>
            <span className="text-brand-muted">من</span>
            <span>{totalPages}</span>
          </div>

          {currentPage < totalPages ? (
            <Link
              href={`/categories/${slug}?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-espresso hover:border-brand-caramel transition-colors"
            >
              الصفحة التالية
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-brand-cream text-xs font-bold text-brand-muted/50 cursor-not-allowed">
              الصفحة التالية
            </span>
          )}
        </div>
      )}
    </div>
  );
}
