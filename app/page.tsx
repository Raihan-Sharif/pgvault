"use client";

import { BackupTab } from "@/components/BackupTab";
import { Footer } from "@/components/Footer";
import { HistoryTab } from "@/components/HistoryTab";
import { useTranslation } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { RestoreTab } from "@/components/RestoreTab";
import { SvgBackground } from "@/components/SvgBackground";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BackupFile } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Database,
  FileArchive,
  Gauge,
  History,
  Layers,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import * as React from "react";

type Tab = "backup" | "restore" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<Tab>("backup");
  const [backupFiles, setBackupFiles] = React.useState<BackupFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  const fetchBackups = React.useCallback(async () => {
    try {
      const response = await fetch("/api/backups");
      const data = await response.json();
      if (data.success) {
        setBackupFiles(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const tabs = [
    {
      id: "backup" as Tab,
      label: t.nav.backup,
      icon: Database,
      gradient: "from-cyan-500 to-teal-600 dark:from-indigo-500 dark:to-violet-600",
      shadow: "shadow-cyan-500/25 dark:shadow-indigo-500/25",
    },
    {
      id: "restore" as Tab,
      label: t.nav.restore,
      icon: Upload,
      gradient: "from-emerald-500 to-teal-600 dark:from-emerald-500 dark:to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      id: "history" as Tab,
      label: t.nav.history,
      icon: History,
      gradient: "from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-600",
      shadow: "shadow-amber-500/25",
    },
  ];

  const features = [
    {
      icon: Layers,
      title: t.features.completeCoverage,
      description: t.features.completeCoverageDesc,
      gradient: "from-violet-500 to-purple-600",
      stat: "100%",
      statLabel: t.features.complete,
    },
    {
      icon: Zap,
      title: t.features.lightningFast,
      description: t.features.lightningFastDesc,
      gradient: "from-amber-500 to-orange-600",
      stat: "10x",
      statLabel: t.features.faster,
    },
    {
      icon: Shield,
      title: t.features.productionReady,
      description: t.features.productionReadyDesc,
      gradient: "from-emerald-500 to-teal-600",
      stat: "99.9%",
      statLabel: t.features.uptime,
    },
    {
      icon: RotateCcw,
      title: t.features.instantRestore,
      description: t.features.instantRestoreDesc,
      gradient: "from-rose-500 to-pink-600",
      stat: "<1min",
      statLabel: t.features.recovery,
    },
  ];

  const totalBackups = backupFiles.length;
  const totalSize = backupFiles.reduce((acc, file) => acc + file.size, 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      {/* SVG Background Decorations */}
      <SvgBackground />

      <main className="relative min-h-screen">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">

          {/* Header Section */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 sm:mb-12 lg:mb-14"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Brand */}
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-500 dark:from-indigo-500 dark:to-violet-600 rounded-2xl blur-xl opacity-50" />
                  
                  {/* Logo container */}
                  <div className="relative p-4 bg-gradient-to-br from-cyan-500 to-teal-500 dark:from-indigo-500 dark:to-violet-600 rounded-2xl shadow-2xl">
                    {/* Custom SVG Logo */}
                    <svg
                      className="w-10 h-10 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="currentColor" strokeWidth="2" />
                      <ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
                      <path d="M12 9v6m-3-3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </motion.div>

                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display gradient-text">
                    PGVault
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    PostgreSQL Backup & Restore Platform
                  </p>
                </div>
              </div>

              {/* Quick Stats & Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass px-5 py-3.5 rounded-xl flex items-center gap-4"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 dark:from-indigo-500 dark:to-violet-600 shadow-lg">
                    <FileArchive className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t.stats.totalBackups}</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{totalBackups}</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass px-5 py-3.5 rounded-xl flex items-center gap-4"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t.stats.storageUsed}</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{formatBytes(totalSize)}</div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={fetchBackups}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3.5 glass rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                  aria-label="Refresh backups"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? "animate-spin" : ""}`} />
                </motion.button>

                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <div className="space-y-8 sm:space-y-10">
            {/* Tabs Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-ultra overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/50 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base
                          flex items-center justify-center gap-3
                          transition-all duration-300
                          ${isActive
                            ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl ${tab.shadow}`
                            : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                          }
                        `}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "backup" && (
                      <BackupTab
                        onBackupComplete={() => {
                          fetchBackups();
                          setTimeout(() => setActiveTab("history"), 1500);
                        }}
                      />
                    )}

                    {activeTab === "restore" && (
                      <RestoreTab
                        backupFiles={backupFiles}
                        onRestoreComplete={() => fetchBackups()}
                      />
                    )}

                    {activeTab === "history" && (
                      <HistoryTab
                        backupFiles={backupFiles}
                        onRefresh={fetchBackups}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Feature Cards Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className={`p-3.5 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                          {feature.stat}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                          {feature.statLabel}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {t.status.systemStatus}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t.status.allOperational}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{t.status.postgresConnected}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Gauge className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{t.status.ready}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
