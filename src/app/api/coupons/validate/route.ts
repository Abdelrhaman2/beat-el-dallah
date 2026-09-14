import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (!coupon) {
      // Fallback check for initial seeded coupon
      if (code.trim().toUpperCase() === "DALLAH10") {
        return NextResponse.json({
          valid: true,
          coupon: {
            id: "dallah-10",
            code: "DALLAH10",
            discount_type: "percentage",
            discount_value: 10,
            is_active: true,
          },
        });
      }
      return NextResponse.json({ valid: false, error: "Invalid coupon" }, { status: 404 });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "Coupon has expired" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}
