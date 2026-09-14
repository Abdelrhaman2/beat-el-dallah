"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { MOCK_PRODUCTS } from "@/lib/supabase/mock-data";
import { Product, ProductVariant } from "@/types";
import {
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  Flame,
  Check,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Layers,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, isArabic, locale } = useI18n();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data } = await supabase
          .from("products")
          .select("*, category:categories(*), variants:product_variants(*)")
          .eq("slug", slug)
          .single();

        if (data) {
          setProduct(data);
          setSelectedImage(data.image_url_1);
          const defVariant = data.variants?.find((v: ProductVariant) => v.is_default) || data.variants?.[0];
          setSelectedVariant(defVariant || null);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to mock data
      }

      const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
      if (mock) {
        setProduct(mock);
        setSelectedImage(mock.image_url_1);
        const defVariant = mock.variants?.find((v) => v.is_default) || mock.variants?.[0];
        setSelectedVariant(defVariant || null);
      }
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-96 max-w-lg mx-auto bg-brand-border/40 rounded-3xl mb-8" />
        <div className="h-8 w-64 mx-auto bg-brand-border/40 rounded-xl mb-4" />
        <div className="h-4 w-96 mx-auto bg-brand-border/40 rounded" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const title = isArabic ? product.name_ar : product.name_en;
  const description = isArabic ? product.short_description_ar : product.short_description_en;
  const currentPrice = selectedVariant?.price_override ?? product.base_price;
  const unitPrice = currentPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant?.id || "base"}`,
      productId: product.id,
      slug: product.slug,
      nameAr: product.name_ar,
      nameEn: product.name_en,
      imageUrl: product.image_url_1,
      price: unitPrice,
      quantity,
      variantId: selectedVariant?.id,
      variantLabelAr: selectedVariant?.attribute_value_ar,
      variantLabelEn: selectedVariant?.attribute_value_en,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleDirectWhatsAppOrder = () => {
    const variantDesc = selectedVariant
      ? isArabic
        ? ` (${selectedVariant.attribute_value_ar})`
        : ` (${selectedVariant.attribute_value_en})`
      : "";

    const msg = isArabic
      ? `مرحباً بيت الدلة، أود الاستفسار وطلب:\n` +
        `• ${product.name_ar}${variantDesc} × ${quantity}\n` +
        `• السعر الإجمالي: ${totalPrice.toFixed(2)} ج.م\n` +
        `يرجى تزويدي ببيانات التوصيل وحساب العربون.`
      : `Hello Beit El Dallah, I would like to order:\n` +
        `• ${product.name_en}${variantDesc} x ${quantity}\n` +
        `• Total: ${totalPrice.toFixed(2)} EGP\n` +
        `Please provide delivery confirmation.`;

    window.open(`https://wa.me/201012345678?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link href="/" className="hover:text-brand-caramel">
          {t.navHome}
        </Link>
        <span>/</span>
        <Link href="/categories/dallah-coffee" className="hover:text-brand-caramel">
          {t.navCategories}
        </Link>
        <span>/</span>
        <span className="text-brand-espresso line-clamp-1">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery Column (2 Images) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-brand-surface border border-brand-border shadow-warm">
            <Image
              src={selectedImage || product.image_url_1}
              alt={title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* 2-Image Thumbnails */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedImage(product.image_url_1)}
              className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedImage === product.image_url_1
                  ? "border-brand-caramel shadow-md scale-105"
                  : "border-brand-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={product.image_url_1} alt="View 1" fill className="object-cover" />
            </button>

            {product.image_url_2 && (
              <button
                onClick={() => setSelectedImage(product.image_url_2!)}
                className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImage === product.image_url_2
                    ? "border-brand-caramel shadow-md scale-105"
                    : "border-brand-border opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={product.image_url_2} alt="View 2" fill className="object-cover" />
              </button>
            )}
          </div>
        </div>

        {/* Product Details & Selection Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="inline-block text-xs font-bold text-brand-caramel uppercase tracking-widest mb-2">
              {isArabic ? "بيت الدلة • بن فاخر معتمد" : "Beit El Dallah Roastery"}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-espresso leading-tight">
              {title}
            </h1>
          </div>

          {/* Live Reactive Price */}
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-muted block">{isArabic ? "السعر للعبوة المختارة" : "Selected Unit Price"}</span>
              <span className="text-3xl font-black text-brand-espresso">
                {formatPrice(unitPrice, locale)}
              </span>
            </div>

            <div className="text-end">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                {t.inStock}
              </span>
              <span className="text-[11px] text-brand-muted mt-1 block">
                {isArabic ? "عربون 25% فقط" : "25% Deposit Model"}
              </span>
            </div>
          </div>

          {description && (
            <p className="text-sm text-brand-muted leading-relaxed">
              {description}
            </p>
          )}

          {/* Dynamic Variant Selector (Live Price Updates) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-brand-espresso flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-caramel" />
                <span>{t.selectWeight}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const label = isArabic ? variant.attribute_value_ar : variant.attribute_value_en;
                  const variantPrice = variant.price_override ?? product.base_price;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl text-start border transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-caramel bg-brand-caramel/10 text-brand-espresso font-bold shadow-sm"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:border-brand-caramel/50"
                      }`}
                    >
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[11px] text-brand-caramel mt-0.5">
                        {formatPrice(variantPrice, locale)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Actions */}
          <div className="pt-4 border-t border-brand-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-border rounded-xl bg-brand-surface p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-brand-muted hover:text-brand-espresso transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-brand-espresso">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-brand-muted hover:text-brand-espresso transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Total Calculation Preview */}
              <div className="flex-1 text-end">
                <span className="text-xs text-brand-muted block">{isArabic ? "الإجمالي" : "Total"}</span>
                <span className="text-xl font-black text-brand-caramel">
                  {formatPrice(totalPrice, locale)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-xl bg-brand-caramel hover:bg-brand-caramel/95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-warm transition-all cursor-pointer active:scale-98"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectWhatsAppOrder}
                className="w-full py-4 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.orderViaWhatsAppDirect}</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-border space-y-2 text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-caramel flex-shrink-0" />
              <span>{t.freeDeliveryNote}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-caramel flex-shrink-0" />
              <span>{isArabic ? "تحويل العربون بأمان عبر انستاباي أو فودافون كاش" : "Direct deposit verification via InstaPay / Vodafone Cash"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications JSONB Table */}
      {product.specs && product.specs.length > 0 && (
        <div className="bg-brand-surface rounded-3xl border border-brand-border p-8 shadow-warm space-y-6">
          <h3 className="text-xl font-black text-brand-espresso flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-caramel" />
            <span>{t.productSpecs}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.specs.map((spec, index) => {
              const label = isArabic ? spec.label_ar : spec.label_en;
              const value = isArabic ? spec.value_ar : spec.value_en;
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-brand-cream/40 border border-brand-border flex flex-col justify-center"
                >
                  <span className="text-xs font-semibold text-brand-muted">{label}</span>
                  <span className="text-sm font-bold text-brand-espresso mt-1">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
