"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FolderTree,
  Tag,
  Settings,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render children directly without sidebar
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    const auth = localStorage.getItem("beit-el-dallah-admin-auth");
    if (auth === "authenticated") {
      setAuthorized(true);
    } else {
      router.push("/admin/login");
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-caramel" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "لوحة المؤشرات", icon: LayoutDashboard },
    { href: "/admin/orders", label: "إدارة الطلبات", icon: ShoppingBag },
    { href: "/admin/products", label: "إدارة المنتجات", icon: Layers },
    { href: "/admin/categories", label: "الأقسام", icon: FolderTree },
    { href: "/admin/coupons", label: "كوبونات الخصم", icon: Tag },
    { href: "/admin/settings", label: "إعدادات المتجر", icon: Settings },
    { href: "/admin/reports", label: "التقارير والمبيعات", icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("beit-el-dallah-admin-auth");
    document.cookie = "admin_auth=; path=/admin; max-age=0";
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-brand-espresso text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm text-brand-gold">لوحة الإدارة</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 inset-y-0 right-0 w-64 bg-brand-espresso text-amber-50/90 flex flex-col justify-between border-l border-brand-espresso/80 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Admin Header */}
          <div className="border-b border-white/10 pb-4">
            <Link href="/admin" className="block">
              <h2 className="text-lg font-black text-white">بيت الدلة</h2>
              <span className="text-[11px] text-brand-gold font-bold">لوحة الإدارة والتحكم</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand-caramel text-white shadow-sm"
                      : "text-amber-100/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-amber-200/80 hover:bg-white/5 transition-colors"
          >
            <span>زيارة المتجر العام</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
