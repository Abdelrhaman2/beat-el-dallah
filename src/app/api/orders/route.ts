import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { generateOrderRef } from "@/lib/utils";
import { buildWhatsAppOrderMessage } from "@/lib/utils/whatsapp";

interface OrderItemInput {
  productId: string;
  variantId?: string | null;
  nameSnapshot: string;
  variantSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
}

interface OrderRequestPayload {
  customerName: string;
  customerPhone: string;
  governorate: string;
  addressDetails: string;
  notes?: string;
  items: OrderItemInput[];
  couponCode?: string | null;
  locale?: "ar" | "en";
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderRequestPayload = await req.json();

    if (!body.customerName || !body.customerPhone || !body.governorate || !body.addressDetails) {
      return NextResponse.json(
        { success: false, error: "Missing required customer delivery fields." },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    // Amendment #1: Privileged admin client using service_role key to bypass anon RLS safely
    const supabase = createAdminSupabaseClient();

    // 1. Fetch live site settings for deposit percentage & whatsapp number
    let depositPercentage = 25.0;
    let whatsappNumber = "201012345678";

    try {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("deposit_percentage, whatsapp_number")
        .eq("id", 1)
        .single();

      if (settings) {
        depositPercentage = Number(settings.deposit_percentage) || 25.0;
        whatsappNumber = settings.whatsapp_number || "201012345678";
      }
    } catch {
      // Use defaults
    }

    // 2. Server-side validation of line items & subtotal calculation
    let computedSubtotal = 0;
    const validatedItems = body.items.map((item) => {
      const unitPrice = Number(item.unitPrice);
      const quantity = Math.max(1, Math.floor(Number(item.quantity)));
      const lineTotal = unitPrice * quantity;
      computedSubtotal += lineTotal;

      return {
        product_id: item.productId || null,
        variant_id: item.variantId || null,
        name_snapshot: item.nameSnapshot,
        variant_snapshot: item.variantSnapshot || null,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
      };
    });

    // 3. Server-side Coupon validation & discount computation
    let discountAmount = 0;
    let validCouponCode: string | null = null;

    if (body.couponCode) {
      try {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", body.couponCode.trim().toUpperCase())
          .eq("is_active", true)
          .single();

        if (coupon) {
          validCouponCode = coupon.code;
          if (coupon.discount_type === "percentage") {
            discountAmount = (computedSubtotal * Number(coupon.discount_value)) / 100;
          } else {
            discountAmount = Math.min(Number(coupon.discount_value), computedSubtotal);
          }

          // Increment coupon usage
          await supabase
            .from("coupons")
            .update({ times_used: (coupon.times_used || 0) + 1 })
            .eq("id", coupon.id);
        }
      } catch {
        // Continue without discount if coupon check fails
      }
    }

    // 4. Compute final deposit amount
    const netTotal = Math.max(0, computedSubtotal - discountAmount);
    const depositAmount = (netTotal * depositPercentage) / 100;

    // 5. Generate human-friendly reference (e.g. BD-2026-00123)
    const orderRef = generateOrderRef();

    // 6. Insert Order into PostgreSQL using service_role
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        governorate: body.governorate,
        address_details: `${body.addressDetails}${body.notes ? ` (ملاحظات: ${body.notes})` : ""}`,
        subtotal: computedSubtotal,
        deposit_percentage: depositPercentage,
        deposit_amount: depositAmount,
        status: "pending",
        coupon_code: validCouponCode,
        discount_amount: discountAmount,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { success: false, error: orderError?.message || "Failed to persist order in database." },
        { status: 500 }
      );
    }

    // 7. Insert Order Items
    const itemsToInsert = validatedItems.map((item) => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
    }

    // 8. Build WhatsApp URL with length safeguard (Amendment #6)
    const isArabic = body.locale !== "en";
    const { messageText, whatsappUrl } = buildWhatsAppOrderMessage({
      order: {
        ...orderData,
        items: validatedItems,
      },
      isArabic,
      whatsappNumber,
    });

    return NextResponse.json({
      success: true,
      orderRef,
      orderId: orderData.id,
      whatsappUrl,
      messageText,
    });
  } catch (err: any) {
    console.error("Order processing exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
