"use client";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PGVault",
    applicationCategory: "DatabaseApplication",
    operatingSystem: "Web",
    description:
      "Professional PostgreSQL backup & restore tool with real-time progress tracking, GZIP compression, and beautiful UI. Works on all serverless platforms.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Real-time backup progress tracking",
      "Complete PostgreSQL backup (tables, views, functions, triggers, sequences, enums)",
      "GZIP compression support",
      "One-click restore",
      "Beautiful dark/light UI",
      "Serverless compatible (works on Vercel, Netlify, etc.)",
      "No pg_dump required",
      "Live console output",
      "Table-by-table progress display",
      "Professional glassmorphic design",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
