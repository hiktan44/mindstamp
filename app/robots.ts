import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/"] }], sitemap: "https://mindstamp.seymata.com/sitemap.xml", host: "https://mindstamp.seymata.com" }; }
