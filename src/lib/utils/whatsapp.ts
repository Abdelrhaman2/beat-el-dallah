import { Order, OrderItem } from "@/types";

interface WhatsAppOrderOptions {
  order: Order & { items: OrderItem[] };
  isArabic: boolean;
  whatsappNumber: string;
}

export function buildWhatsAppOrderMessage({
  order,
  isArabic,
  whatsappNumber,
}: WhatsAppOrderOptions): { messageText: string; whatsappUrl: string } {
  const lineCount = order.items?.length || 0;
  // Amendment #6: Safeguard against wa.me URL truncation for large orders
  const isLargeOrder = lineCount > 6;

  let messageText = "";

  if (isArabic) {
    const header =
      `☕ *طلب جديد من بيت الدلة | Beit El Dallah*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🔢 *رقم الطلب:* ${order.order_ref}\n` +
      `👤 *العميل:* ${order.customer_name}\n` +
      `📞 *الهاتف:* ${order.customer_phone}\n` +
      `📍 *المحافظة:* ${order.governorate}\n` +
      `🏠 *العنوان:* ${order.address_details}\n` +
      `━━━━━━━━━━━━━━━━━━━\n`;

    let itemsSection = "";

    if (isLargeOrder) {
      // Summary format for large orders
      itemsSection =
        `📦 *المنتجات المطلوبة:*\n` +
        `• إجمالي عدد المنتجات: ${lineCount} عناصر متنوعة\n` +
        `📌 *(تفاصيل المنتجات بالكامل مسجلة تحت رقم الطلب في النظام)*\n`;
    } else {
      // Detailed itemized format
      itemsSection = `📦 *تفاصيل المنتجات:*\n`;
      order.items.forEach((item, index) => {
        const variantText = item.variant_snapshot ? ` (${item.variant_snapshot})` : "";
        itemsSection += `${index + 1}. ${item.name_snapshot}${variantText} × ${item.quantity} = ${item.line_total.toFixed(2)} ج.م\n`;
      });
    }

    const footer =
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *إجمالي المنتجات:* ${order.subtotal.toFixed(2)} ج.م\n` +
      (order.discount_amount > 0 ? `🏷️ *الخصم (${order.coupon_code || ""}):* -${order.discount_amount.toFixed(2)} ج.م\n` : "") +
      `💵 *العربون المطلوب (${order.deposit_percentage}%):* ${order.deposit_amount.toFixed(2)} ج.م\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📲 *طرق التحويل:* فودافون كاش / انستاباي\n` +
      `⚠️ *يرجى إرسال لقطة شاشة (Screenshot) لإيصال تحويل العربون لتأكيد الطلب وبدء الشحن.*`;

    messageText = header + itemsSection + footer;

    // Check if encoded string exceeds 1,500 characters, fallback to summary if needed
    if (encodeURIComponent(messageText).length > 1500 && !isLargeOrder) {
      itemsSection =
        `📦 *المنتجات المطلوبة:*\n` +
        `• إجمالي ${lineCount} عناصر مسجلة بالنظام\n`;
      messageText = header + itemsSection + footer;
    }
  } else {
    // English Format
    const header =
      `☕ *New Order - Beit El Dallah*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🔢 *Order Ref:* ${order.order_ref}\n` +
      `👤 *Customer:* ${order.customer_name}\n` +
      `📞 *Phone:* ${order.customer_phone}\n` +
      `📍 *Governorate:* ${order.governorate}\n` +
      `🏠 *Address:* ${order.address_details}\n` +
      `━━━━━━━━━━━━━━━━━━━\n`;

    let itemsSection = "";

    if (isLargeOrder) {
      itemsSection =
        `📦 *Ordered Items:*\n` +
        `• Total of ${lineCount} items registered\n` +
        `📌 *(Full itemized list is saved under order reference in database)*\n`;
    } else {
      itemsSection = `📦 *Line Items:*\n`;
      order.items.forEach((item, index) => {
        const variantText = item.variant_snapshot ? ` (${item.variant_snapshot})` : "";
        itemsSection += `${index + 1}. ${item.name_snapshot}${variantText} × ${item.quantity} = ${item.line_total.toFixed(2)} EGP\n`;
      });
    }

    const footer =
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Subtotal:* ${order.subtotal.toFixed(2)} EGP\n` +
      (order.discount_amount > 0 ? `🏷️ *Discount (${order.coupon_code || ""}):* -${order.discount_amount.toFixed(2)} EGP\n` : "") +
      `💵 *Required Deposit (${order.deposit_percentage}%):* ${order.deposit_amount.toFixed(2)} EGP\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📲 *Payment Methods:* Vodafone Cash / InstaPay / Bank Transfer\n` +
      `⚠️ *Please send a screenshot of your transfer receipt to confirm dispatch.*`;

    messageText = header + itemsSection + footer;

    if (encodeURIComponent(messageText).length > 1500 && !isLargeOrder) {
      itemsSection =
        `📦 *Ordered Items:*\n` +
        `• Total ${lineCount} items registered\n`;
      messageText = header + itemsSection + footer;
    }
  }

  // Clean phone number (digits only)
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

  return { messageText, whatsappUrl };
}
