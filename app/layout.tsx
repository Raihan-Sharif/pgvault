import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/StructuredData";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PGVault - Professional PostgreSQL Backup & Restore Tool",
    template: "%s | PGVault",
  },
  description:
    "World-class PostgreSQL backup & restore tool with real-time progress tracking, GZIP compression, and beautiful UI. Backup your database with confidence. No pg_dump required - works on Vercel, Netlify, and all serverless platforms.",
  keywords: [
    "postgresql backup",
    "postgres backup tool",
    "database backup",
    "pg_dump alternative",
    "postgres restore",
    "database migration",
    "serverless postgres backup",
    "neon backup",
    "supabase backup",
    "postgres backup ui",
    "postgresql backup software",
    "cloud database backup",
    "database backup tool",
    "postgres backup script",
    "pgvault",
    "real-time database backup",
    "postgres export",
    "database clone",
  ],
  authors: [{ name: "PGVault Team" }],
  creator: "PGVault",
  metadataBase: new URL("https://pgvault.com"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pgvault.com",
    title: "PGVault - Professional PostgreSQL Backup & Restore Tool",
    description:
      "World-class PostgreSQL backup tool with real-time progress tracking, GZIP compression, and beautiful dark/light UI. Works on all serverless platforms.",
    siteName: "PGVault",
  },

  twitter: {
    card: "summary_large_image",
    title: "PGVault - PostgreSQL Backup Tool",
    description:
      "Real-time PostgreSQL backup with beautiful UI. Works on Vercel, Netlify, and all serverless platforms.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
