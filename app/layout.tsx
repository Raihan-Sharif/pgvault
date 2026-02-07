import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PGVault - PostgreSQL Backup & Restore",
  description:
    "Professional PostgreSQL backup & restore tool with real-time console progress, GZIP compression, and beautiful UI. Secure your database with one click.",
  keywords: ["postgresql", "backup", "restore", "database", "pgvault", "neon"],
  openGraph: {
    title: "PGVault - PostgreSQL Backup & Restore",
    description:
      "Professional PostgreSQL backup & restore tool with real-time console progress and beautiful UI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
