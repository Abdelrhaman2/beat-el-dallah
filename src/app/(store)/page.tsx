"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { ProductCard } from "@/components/store/ProductCard";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/supabase/mock-data";
import { Category, Product } from "@/types";
import { supabase } from "@/lib/supabase/client";
import {
  Coffee,
  ArrowRight,
  ArrowLeft,
  Flame,
  Truck,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Package,
} from "lucide-react";

export default function HomePage() {
  const { t, isArabic } = useI18n();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function fetchData() {
      try {
        // Attempt fetching from Supabase
        const { data: catData } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (catData && catData.length > 0) {
          setCategories(catData);
        }

        const { data: prodData } = await supabase
          .from("products")
          .select("*, variants:product_variants(*)")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(8);

        if (prodData && prodData.length > 0) {
          setFeaturedProducts(prodData);
        }
      } catch {
        // Gracefully use initial mock data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-espresso via-brand-dark to-brand-espresso text-white py-20 lg:py-28">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 end-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-caramel/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 translate-y-12 -translate-x-12 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left/Start Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-caramel/20 border border-brand-caramel/40 text-brand-gold text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isArabic ? "بيت الدلة للقهوة المختصة ومستلزمات الكافيهات" : "Specialty Coffee & Cafe Supplies"}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] text-white">
                {isArabic ? (
                  <>
                    أصالة القهوة العربية <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-brand-caramel">
                      وتجهيزات المقاهي الفاخرة
                    </span>
                  </>
                ) : (
                  <>
                    Authentic Arabic Coffee <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-brand-caramel">
                      &amp; Artisan Cafe Supplies
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-amber-100/80 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#featured-products"
                  className="px-7 py-3.5 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-sm shadow-warm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{t.heroShopNow}</span>
                  <ArrowIcon className="w-4 h-4" />
                </a>

                <a
                  href="#categories"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  <span>{t.heroExploreCategories}</span>
                </a>
              </div>

              {/* Feature Badges */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <Flame className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>{t.badgeFreshRoast}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-200">
                  <Truck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>{t.badgeFastShipping}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-200 col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>{t.badgeDepositCheckout}</span>
                </div>
              </div>
            </div>

            {/* Right/End Hero Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-brand-caramel/40 shadow-2xl group">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop"
                  alt="Beit El Dallah Coffee Roastery"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-transparent to-transparent opacity-80" />

                {/* Floating Highlight Box */}
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl glass-card text-brand-espresso border border-brand-border/60 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-caramel uppercase tracking-wider block">
                        {isArabic ? "الخلطة الملكية الأكثر طلباً" : "Most Coveted Blend"}
                      </span>
                      <h4 className="text-sm font-black text-brand-espresso">
                        {isArabic ? "بن الدلة - الخلطة الذهبية بالزعفران والهيل" : "Royal Saffron Golden Dallah"}
                      </h4>
                    </div>
                    <span className="text-base font-black text-brand-caramel">195 ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The 6 Categories Showcase */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-caramel/10 text-brand-caramel text-xs font-bold">
            <Coffee className="w-3.5 h-3.5" />
            <span>{t.categoriesTitle}</span>
          </div>
          <h2 className="text-3xl font-black text-brand-espresso">{t.categoriesSubtitle}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => {
            const catTitle = isArabic ? category.name_ar : category.name_en;
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative flex flex-col items-center bg-brand-surface p-4 rounded-2xl border border-brand-border hover:border-brand-caramel hover:shadow-warm-lg transition-all text-center"
              >
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-brand-cream border-2 border-brand-border group-hover:border-brand-caramel transition-colors mb-3">
                  <Image
                    src={category.image_url || "/images/placeholder.webp"}
                    alt={catTitle}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <h3 className="font-bold text-sm text-brand-espresso group-hover:text-brand-caramel transition-colors">
                  {catTitle}
                </h3>
                <span className="text-[11px] text-brand-muted mt-0.5">
                  {t.exploreCategory}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section id="featured-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-caramel/10 text-brand-caramel text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.featuredProducts}</span>
            </div>
            <h2 className="text-3xl font-black text-brand-espresso">{t.featuredSubtitle}</h2>
          </div>

          <Link
            href="/categories/dallah-coffee"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-caramel hover:text-brand-espresso transition-colors"
          >
            <span>{t.viewAllProducts}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. WhatsApp Order Workflow Explained */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface rounded-3xl border border-brand-border p-8 sm:p-12 shadow-warm">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-brand-caramel uppercase tracking-widest block">
              {isArabic ? "سهولة وأمان الدفع" : "Simple & Secure Ordering"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-espresso">
              {isArabic ? "كيف تتم عملية الطلب في بيت الدلة؟" : "How Ordering Works at Beit El Dallah"}
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted">
              {isArabic
                ? "بدون بوابات دفع معقدة وبدون رسوم إضافية — احجز طلبك بعربون ميسر عبر واتساب"
                : "No payment gateway fees — secure your order with a simple WhatsApp deposit handoff"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border/80 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-caramel text-white flex items-center justify-center font-black text-sm">
                1
              </span>
              <h3 className="font-bold text-sm text-brand-espresso">
                {isArabic ? "اختر حبوبك وتجهيزاتك" : "Choose Your Beans"}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {isArabic
                  ? "حدد الوزن المناسب (250g، 500g، 1kg) ونوع الطحنة المفضلة لطريقتك في التحضير."
                  : "Pick your preferred weight and exact grind size for your brewing gear."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border/80 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-caramel text-white flex items-center justify-center font-black text-sm">
                2
              </span>
              <h3 className="font-bold text-sm text-brand-espresso">
                {isArabic ? "أدخل بياناتك والمحافظة" : "Enter Delivery Info"}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {isArabic
                  ? "سجل اسمك ورقم هاتفك ومحافظتك مع حساب قيمة العربون المطلوب (25%) تلقائياً."
                  : "Enter your contact info and Egyptian governorate with instant deposit calculation."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border/80 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-caramel text-white flex items-center justify-center font-black text-sm">
                3
              </span>
              <h3 className="font-bold text-sm text-brand-espresso">
                {isArabic ? "إرسال الطلب لواتساب" : "WhatsApp Handoff"}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {isArabic
                  ? "يتم حفظ طلبك بالنظام كـ (قيد الانتظار) ويفتح واتساب برسالة منسقة بكافة التفاصيل."
                  : "Order is saved to DB as pending, and WhatsApp opens with formatted order message."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border/80 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-caramel text-white flex items-center justify-center font-black text-sm">
                4
              </span>
              <h3 className="font-bold text-sm text-brand-espresso">
                {isArabic ? "تحويل العربون والتأكيد" : "Deposit Transfer"}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {isArabic
                  ? "حول العربون عبر انستاباي أو فودافون كاش، وأرسل سكرين شوت بالمحادثة لنبدأ الشحن فوراً."
                  : "Send transfer receipt via InstaPay or Vodafone Cash to dispatch your order."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Direct Assistance Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-start">
            <h3 className="text-2xl sm:text-3xl font-black">
              {isArabic ? "هل تمتلك كافيه أو تحتاج كميات تجارية خاصة؟" : "Operating a Cafe or Need Wholesale Beans?"}
            </h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              {isArabic
                ? "نوفر أسعاراً خاصة لكافيهات ومحامص مصر وتوريد شهري منتظم ومعدات بضمان."
                : "We supply specialty coffee beans and commercial equipment for cafes across Egypt."}
            </p>
          </div>

          <a
            href="https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AA%D9%88%D8%B1%D9%8A%D8%AF%D8%A7%D8%AA%20%D8%A7%D9%84%D9%83%D8%A7%D9%81%D9%8A%D9%87%D8%A7%D8%AA"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm flex items-center gap-2 shadow-lg transition-all flex-shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>{isArabic ? "تواصل مع قسم المبيعات" : "Contact Wholesale Team"}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
