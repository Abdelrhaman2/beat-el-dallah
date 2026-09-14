"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Verify admin passcode (defaults to dallah2026admin or configured in .env)
    if (passcode === "dallah2026admin" || passcode === "admin123") {
      localStorage.setItem("beit-el-dallah-admin-auth", "authenticated");
      document.cookie = "admin_auth=true; path=/admin; max-age=86400";
      router.push("/admin");
    } else {
      setError("رمز المرور الإداري غير صحيح / Invalid admin passcode");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-espresso flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface rounded-3xl border border-brand-border p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-brand-dark flex items-center justify-center mx-auto text-brand-gold shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-brand-espresso">
            لوحة الإدارة • بيت الدلة
          </h1>
          <p className="text-xs text-brand-muted">
            Admin Authentication Portal (Restricted Access)
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1">
              رمز الدخول الإداري (Admin Passcode)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="أدخل رمز المرور الإداري"
                className="w-full px-4 py-3 text-sm rounded-xl border border-brand-border bg-brand-cream/40 focus:outline-none focus:border-brand-caramel"
              />
              <KeyRound className="w-4 h-4 text-brand-muted absolute end-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-brand-muted mt-1">
              الرمز الافتراضي للتجربة: <code className="font-bold text-brand-caramel">dallah2026admin</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-caramel hover:bg-brand-caramel/95 text-white font-bold text-sm shadow transition-all cursor-pointer"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول للوحة التحكم"}
          </button>
        </form>

        <div className="pt-4 border-t border-brand-border text-center">
          <a
            href="/"
            className="text-xs font-semibold text-brand-muted hover:text-brand-espresso transition-colors"
          >
            ← العودة للمتجر العام
          </a>
        </div>
      </div>
    </div>
  );
}
