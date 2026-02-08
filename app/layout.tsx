import { LanguageProvider } from "@/components/language-provider";
import { StructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#6366f1" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "PGVault - Free PostgreSQL Backup & Restore Tool",
    template: "%s | PGVault",
  },
  description:
    "Free, open-source PostgreSQL backup & restore tool with real-time progress tracking, GZIP compression, and beautiful UI. No pg_dump required - works on Vercel, Netlify, and all serverless platforms.",
  keywords: [
    "postgresql backup",
    "postgres backup tool",
    "free database backup",
    "pg_dump alternative",
    "postgres restore",
    "database migration",
    "serverless postgres backup",
    "neon backup",
    "supabase backup",
    "postgres backup ui",
    "postgresql backup software",
    "cloud database backup",
    "open source backup tool",
    "postgres backup script",
    "pgvault",
    "real-time database backup",
    "postgres export",
    "database clone",
    "free backup tool",
  ],
  authors: [
    {
      name: "Raihan Sharif",
      url: "https://portfolio-blog-app-topaz.vercel.app/",
    },
  ],
  creator: "Raihan Sharif",
  publisher: "Raihan Sharif",
  metadataBase: new URL("https://pgvault.vercel.app"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pgvault.vercel.app",
    title: "PGVault - Free PostgreSQL Backup & Restore Tool",
    description:
      "Free, open-source PostgreSQL backup tool with real-time progress tracking, GZIP compression, and beautiful dark/light UI. Works on all serverless platforms.",
    siteName: "PGVault",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PGVault - PostgreSQL Backup Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PGVault - Free PostgreSQL Backup Tool",
    description:
      "Free, open-source PostgreSQL backup with beautiful UI. Works on Vercel, Netlify, and all serverless platforms.",
    creator: "@raihan_sharif",
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
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }],
  },

  manifest: "/manifest.json",

  alternates: {
    canonical: "https://pgvault.vercel.app",
    languages: {
      "en": "https://pgvault.vercel.app",
      "bn": "https://pgvault.vercel.app?lang=bn",
    },
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PGVault",
  },

  formatDetection: {
    telephone: false,
  },

  other: {
    "mobile-web-app-capable": "yes",
  },
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
        <meta name="author" content="Raihan Sharif" />
        <link rel="author" href="https://portfolio-blog-app-topaz.vercel.app/" />
        {/* PWA Meta Tags */}
        <meta name="application-name" content="PGVault" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PGVault" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
