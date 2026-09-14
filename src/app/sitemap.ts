import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beit-el-dallah.com";

  const staticRoutes = [
    "",
    "/categories/dallah-coffee",
    "/categories/star-coffee",
    "/categories/espresso",
    "/categories/turkish-coffee",
    "/categories/tea",
    "/categories/cafe-supplies",
    "/cart",
    "/checkout",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productRoutes = [
    "/products/dallah-golden-blend",
    "/products/star-house-blend",
    "/products/espresso-supremo",
    "/products/turkish-mastic-cardamom",
    "/products/ceylon-silver-leaf-tea",
    "/products/handmade-copper-cezve-size3",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
