"use client";

// Static base URL - use environment variable or default
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pgvault.vercel.app";

export function StructuredData() {
  // Main Application Schema
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    name: "PGVault",
    alternateName: ["PG Vault", "PostgreSQL Vault", "Postgres Backup Tool"],
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Database Management",
    operatingSystem: "Web Browser",
    url: BASE_URL,
    downloadUrl: "https://github.com/Raihan-Sharif/pgvault",
    description:
      "Free, open-source PostgreSQL backup & restore tool with real-time progress tracking, GZIP compression, and beautiful UI. No pg_dump required - works on Vercel, Netlify, and all serverless platforms.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Real-time backup progress tracking",
      "Complete PostgreSQL backup (tables, views, functions, triggers, sequences, enums)",
      "GZIP compression support",
      "One-click database restore",
      "Beautiful dark/light UI with glassmorphism",
      "Serverless compatible (Vercel, Netlify, Railway, Render)",
      "No pg_dump required",
      "Live console output",
      "Table-by-table progress display",
      "Professional glassmorphic design",
      "Schema-level selection",
      "Backup history management",
      "Download and delete backups",
      "PostgreSQL metadata preservation",
    ],
    screenshot: `${BASE_URL}/og-image.png`,
    softwareVersion: "1.0.0",
    releaseNotes: "Initial release with full backup and restore capabilities",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "1",
      reviewCount: "1",
    },
    author: {
      "@type": "Person",
      name: "Raihan Sharif",
      url: "https://portfolio-blog-app-topaz.vercel.app/",
    },
    maintainer: {
      "@type": "Person",
      name: "Raihan Sharif",
      url: "https://portfolio-blog-app-topaz.vercel.app/",
    },
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    inLanguage: "en",
    keywords: [
      "postgresql backup",
      "postgres backup tool",
      "database backup",
      "pg_dump alternative",
      "postgres restore",
      "database migration",
      "serverless postgres",
      "neon backup",
      "supabase backup",
      "open source backup",
      "free database tool",
    ],
  };

  // WebApplication schema for better web app recognition
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${BASE_URL}/#webapp`,
    name: "PGVault",
    url: BASE_URL,
    applicationCategory: "Database Tool",
    browserRequirements: "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.",
    description: "Professional PostgreSQL backup and restore web application with real-time progress tracking.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  // Organization/Author schema
  const author = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://portfolio-blog-app-topaz.vercel.app/#author",
    name: "Raihan Sharif",
    url: "https://portfolio-blog-app-topaz.vercel.app/",
    sameAs: [
      "https://github.com/Raihan-Sharif",
      "https://linkedin.com/in/raihan-sharif",
    ],
  };

  // WebSite schema for sitelinks
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "PGVault",
    url: BASE_URL,
    description: "Free PostgreSQL Backup & Restore Tool",
    publisher: {
      "@id": "https://portfolio-blog-app-topaz.vercel.app/#author",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // FAQ Schema for common questions (helps with AI SEO)
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What is PGVault?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PGVault is a free, open-source PostgreSQL backup and restore tool with a beautiful UI, real-time progress tracking, and GZIP compression support. It works on serverless platforms like Vercel and doesn't require pg_dump.",
        },
      },
      {
        "@type": "Question",
        name: "Does PGVault require pg_dump?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, PGVault does not require pg_dump or any external database tools. It uses pure JavaScript/TypeScript with the pg library to directly connect to and backup PostgreSQL databases.",
        },
      },
      {
        "@type": "Question",
        name: "Can PGVault backup cloud databases like Neon and Supabase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! PGVault works with any PostgreSQL database including cloud providers like Neon, Supabase, Railway, Render, Amazon RDS, Google Cloud SQL, and Azure Database for PostgreSQL.",
        },
      },
      {
        "@type": "Question",
        name: "Is PGVault free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, PGVault is completely free and open-source under the MIT license. You can use it for personal and commercial projects without any restrictions.",
        },
      },
      {
        "@type": "Question",
        name: "What does PGVault backup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PGVault creates complete PostgreSQL backups including tables with all data, views, functions, triggers, sequences, enums/custom types, indexes, and constraints. It preserves the full schema structure.",
        },
      },
    ],
  };

  // Combine all schemas
  const schemas = [softwareApp, webApp, author, website, faq];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
