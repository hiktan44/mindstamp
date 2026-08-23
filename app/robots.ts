import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/editor/"] }],
    sitemap: "https://interaktiff.com/sitemap.xml",
    host: "https://interaktiff.com",
  };
}
