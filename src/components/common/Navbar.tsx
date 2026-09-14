"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag, MessageCircle, Menu, X, Coffee, Package } from "lucide-react";

export function Navbar() {
  const { t, isArabic } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsCount = useCartStore((state) => state.getItemsCount());
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);

  const navLinks = [
    { href: "/", label: t.navHome },
    { href: "/categories/dallah-coffee", label: isArabic ? "بن الدله" : "Dallah Coffee" },
    { href: "/categories/espresso", label: isArabic ? "اسبريسو" : "Espresso" },
    { href: "/categories/turkish-coffee", label: isArabic ? "بن تركي" : "Turkish Coffee" },
    { href: "/categories/cafe-supplies", label: t.navCafeSupplies },
    { href: "/account/orders", label: t.navOrders },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-brand-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-brand-caramel ${
                    isActive ? "text-brand-caramel font-bold" : "text-brand-espresso"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Items */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Direct WhatsApp Contact Button */}
            <a
              href="https://wa.me/201012345678"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-sm cursor-pointer"
              title="WhatsApp Customer Service"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isArabic ? "خدمة العملاء" : "WhatsApp"}</span>
            </a>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-brand-surface border border-brand-border hover:border-brand-caramel text-brand-espresso hover:text-brand-caramel transition-all cursor-pointer shadow-sm group"
              aria-label={t.navCart}
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[11px] font-black text-white bg-brand-caramel rounded-full shadow-md animate-pulse">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-espresso hover:bg-brand-cream/80 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-brand-surface/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-cream text-brand-caramel font-bold"
                      : "text-brand-espresso hover:bg-brand-cream/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-brand-border flex items-center justify-between">
            <a
              href="https://wa.me/201012345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-full shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isArabic ? "تواصل معنا واتساب" : "Contact via WhatsApp"}</span>
            </a>

            <Link
              href="/account/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-brand-muted hover:text-brand-caramel"
            >
              {t.navOrders}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
