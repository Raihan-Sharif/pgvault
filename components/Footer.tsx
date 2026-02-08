"use client";

import { useTranslation } from "@/components/language-provider";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  Heart,
  Linkedin,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/mdraihansharif/",
    icon: Linkedin,
    color: "hover:text-blue-600 dark:hover:text-blue-400",
  },
  {
    name: "GitHub",
    href: "https://github.com/Raihan-Sharif",
    icon: Github,
    color: "hover:text-slate-900 dark:hover:text-white",
  },
  {
    name: "Portfolio",
    href: "https://portfolio-blog-app-topaz.vercel.app/",
    icon: ExternalLink,
    color: "hover:text-emerald-600 dark:hover:text-emerald-400",
  },
];

const projectLinks = [
  {
    name: "GitHub Repository",
    href: "https://github.com/Raihan-Sharif/pgvault.git",
    icon: Github,
  },
  {
    name: "Report Issues",
    href: "https://github.com/Raihan-Sharif/pgvault/issues",
    icon: ExternalLink,
  },
];



export function Footer() {
  const { t } = useTranslation();
  
  const upcomingFeatures = [
    t.footer.features.scheduling,
    t.footer.features.cloud,
    t.footer.features.encryption,
    t.footer.features.multiDb,
  ];
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-16 border-t border-slate-200 dark:border-slate-800"
    >
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-cyan-500/15 via-teal-500/15 to-emerald-500/15 dark:from-indigo-500/10 dark:via-violet-500/10 dark:to-purple-500/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-teal-600 dark:text-indigo-400" />
              <span className="font-semibold text-black dark:text-white">
                {t.footer.comingSoon}!
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {upcomingFeatures.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-600 dark:bg-indigo-600 text-white border border-teal-700 dark:border-indigo-500"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 dark:from-indigo-500 dark:to-violet-600 rounded-xl shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="currentColor" strokeWidth="2" />
                    <ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                    PGVault
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {t.footer.freeForever}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                Professional PostgreSQL backup & restore tool with real-time progress tracking,
                GZIP compression, and beautiful UI. Works on all serverless platforms.
              </p>
            </div>

            {/* Project Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Project Links
              </h4>
              <ul className="space-y-3">
                {projectLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-indigo-400 transition-colors group"
                      >
                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Author Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Developer
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-400 flex items-center gap-2">
                  {t.footer.madeWith}{" "}
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />{" "}
                  {t.footer.by}{" "}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    Raihan Sharif
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 ${link.color} transition-all hover:scale-110 hover:shadow-lg`}
                        aria-label={link.name}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm text-slate-600 dark:text-slate-500">
              © {new Date().getFullYear()} PGVault. All rights reserved.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Powered by Next.js, TypeScript & PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
