"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isArabic, locale } = useI18n();
  const addItem = useCartStore((state) => state.addItem);

  const title = isArabic ? product.name_ar : product.name_en;
  const description = isArabic ? product.short_description_ar : product.short_description_en;

  // Default variant or base price
  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const activePrice = defaultVariant?.price_override ?? product.base_price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}-${defaultVariant?.id || "base"}`,
      productId: product.id,
      slug: product.slug,
      nameAr: product.name_ar,
      nameEn: product.name_en,
      imageUrl: product.image_url_1,
      price: activePrice,
      quantity: 1,
      variantId: defaultVariant?.id,
      variantLabelAr: defaultVariant?.attribute_value_ar,
      variantLabelEn: defaultVariant?.attribute_value_en,
    });
  };

  return (
    <div className="group relative flex flex-col bg-brand-surface rounded-2xl overflow-hidden border border-brand-border/90 hover:border-brand-caramel/70 transition-all duration-300 hover:shadow-warm-lg">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-brand-cream/40 overflow-hidden block">
        <Image
          src={product.image_url_1}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {defaultVariant && (
          <span className="absolute top-3 end-3 px-2.5 py-1 text-[11px] font-bold bg-brand-espresso/80 text-white backdrop-blur-sm rounded-md shadow">
            {isArabic ? defaultVariant.attribute_value_ar : defaultVariant.attribute_value_en}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/products/${product.slug}`} className="group-hover:text-brand-caramel transition-colors">
          <h3 className="font-bold text-base text-brand-espresso line-clamp-1 mb-1.5 flex items-center justify-between">
            <span>{title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-caramel flex-shrink-0" />
          </h3>
        </Link>

        {description && (
          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4 flex-1">
            {description}
          </p>
        )}

        {/* Price & Action */}
        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-3 mt-auto">
          <div>
            <span className="text-[11px] text-brand-muted block">{isArabic ? "السعر" : "Price"}</span>
            <span className="text-lg font-black text-brand-espresso">
              {formatPrice(activePrice, locale)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-cream text-brand-espresso hover:bg-brand-caramel hover:text-white border border-brand-border hover:border-brand-caramel transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label={`Add ${title} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isArabic ? "أضف" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
