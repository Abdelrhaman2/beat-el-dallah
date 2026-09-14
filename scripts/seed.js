const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oymfimtltmuyuwdmditq.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bWZpbXRsdG11eXV3ZG1kaXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTUzNDEsImV4cCI6MjEwNDg3MTM0MX0.KcNMyI88rwR8XZC3CiySh0uq6ePVuUxu3s3TB24qMu0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log("🌱 Starting Beit El Dallah Database Seed...");

  // 1. Site Settings
  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: 1,
    deposit_percentage: 25.0,
    whatsapp_number: "201012345678",
    payment_instructions_ar:
      "طرق دفع العربون المتاحة:\n• فودافون كاش / المحافظ الإلكترونية: 01012345678\n• انستاباي (InstaPay): beit.eldallah@instapay\n• تحويل بنكي (البنك الأهلي المصري): 12345678901234\nيرجى إرسال لقطة شاشة لإيصال التحويل في رسالة الواتساب لتأكيد طلبك وبدء التجهيز.",
    payment_instructions_en:
      "Available Deposit Payment Methods:\n• Vodafone Cash / Smart Wallets: 01012345678\n• InstaPay: beit.eldallah@instapay\n• Bank Transfer (NBE): 12345678901234\nPlease send a screenshot of the transfer receipt in the WhatsApp chat to confirm your order.",
    store_name_ar: "بيت الدلة",
    store_name_en: "Beit El Dallah",
    logo_url: "/logo.svg",
  });

  if (settingsError) console.error("Settings error:", settingsError.message);
  else console.log("✅ Site settings seeded.");

  // 2. Categories
  const categories = [
    { slug: "dallah-coffee", name_ar: "بن الدله", name_en: "Dallah Coffee", sort_order: 1, is_active: true, image_url: "/images/categories/dallah.webp" },
    { slug: "star-coffee", name_ar: "ستار كوفي", name_en: "Star Coffee", sort_order: 2, is_active: true, image_url: "/images/categories/star.webp" },
    { slug: "espresso", name_ar: "اسبريسو", name_en: "Espresso", sort_order: 3, is_active: true, image_url: "/images/categories/espresso.webp" },
    { slug: "turkish-coffee", name_ar: "بن تركي", name_en: "Turkish Coffee", sort_order: 4, is_active: true, image_url: "/images/categories/turkish.webp" },
    { slug: "tea", name_ar: "شاي", name_en: "Tea", sort_order: 5, is_active: true, image_url: "/images/categories/tea.webp" },
    { slug: "cafe-supplies", name_ar: "مستلزمات الكافيهات", name_en: "Cafe Supplies", sort_order: 6, is_active: true, image_url: "/images/categories/supplies.webp" },
  ];

  for (const cat of categories) {
    await supabase.from("categories").upsert(cat, { onConflict: "slug" });
  }
  console.log("✅ 6 Categories seeded.");

  console.log("🎉 Seed finished successfully!");
}

runSeed();
