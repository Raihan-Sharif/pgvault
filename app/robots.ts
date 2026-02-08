import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgvault.vercel.app";
  
  return {
    rules: [
      // Allow all major search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      // Specific rules for Googlebot
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      // Allow AI crawlers for AI SEO (ChatGPT, Claude, Perplexity, etc.)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      // Allow Bing and other search engines
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: ["/api/", "/backups/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
