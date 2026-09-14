"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { supabase } from "@/lib/supabase/client";
import { Coffee, Lock, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t, isArabic } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        setMessage(isArabic ? "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول." : "Account created successfully! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        router.push("/account/orders");
      }
    } catch (err: any) {
      setError(err.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-brand-surface rounded-3xl border border-brand-border p-8 shadow-warm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-caramel">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-brand-espresso">
            {isSignUp ? (isArabic ? "إنشاء حساب عميل" : "Customer Sign Up") : (isArabic ? "تسجيل دخول العملاء" : "Customer Sign In")}
          </h1>
          <p className="text-xs text-brand-muted">
            {isArabic
              ? "تسجيل الدخول يتيح لك متابعة سجل طلباتك السابقة بسهولة"
              : "Access your past orders and saved delivery preferences"}
          </p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{error}</div>}
        {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1">
              {isArabic ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1">
              {isArabic ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-brand-border bg-brand-cream/30 focus:outline-none focus:border-brand-caramel"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-caramel hover:bg-brand-caramel/90 text-white font-bold text-xs shadow transition-all cursor-pointer"
          >
            {loading ? "..." : isSignUp ? (isArabic ? "إنشاء الحساب" : "Create Account") : (isArabic ? "تسجيل الدخول" : "Sign In")}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-brand-caramel hover:underline"
          >
            {isSignUp
              ? isArabic ? "لديك حساب بالفعل؟ سجل الدخول هنا" : "Already have an account? Sign in"
              : isArabic ? "ليس لديك حساب؟ اضغط هنا لإنشاء حساب جديد" : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="pt-4 border-t border-brand-border text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-caramel font-semibold">
            <span>{t.backToHome}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
