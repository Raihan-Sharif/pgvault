import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
    ],
    sitemap: "https://pgvault.com/sitemap.xml",
  };
}
