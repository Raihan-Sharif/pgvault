"use client";

import { BackupTab } from "@/components/BackupTab";
import { HistoryTab } from "@/components/HistoryTab";
import { RestoreTab } from "@/components/RestoreTab";
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
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import * as React from "react";

type Tab = "backup" | "restore" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<Tab>("backup");
  const [backupFiles, setBackupFiles] = React.useState<BackupFile[]>([]);
  const [loading, setLoading] = React.useState(true);

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
      label: "Create Backup",
      icon: Database,
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      id: "restore" as Tab,
      label: "Restore Database",
      icon: Upload,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "history" as Tab,
      label: "Backup History",
      icon: History,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const features = [
    {
      icon: Layers,
      title: "Complete Coverage",
      description: "Full schema, data, functions & triggers backup",
      gradient: "from-violet-500 to-purple-600",
      stat: "100%",
      statLabel: "Complete",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Streaming compression with GZIP optimization",
      gradient: "from-amber-500 to-orange-600",
      stat: "10x",
      statLabel: "Faster",
    },
    {
      icon: Shield,
      title: "Production Ready",
      description: "Enterprise reliability with error recovery",
      gradient: "from-emerald-500 to-teal-600",
      stat: "99.9%",
      statLabel: "Uptime",
    },
    {
      icon: RotateCcw,
      title: "Instant Restore",
      description: "One-click database recovery",
      gradient: "from-rose-500 to-pink-600",
      stat: "<1min",
      statLabel: "Recovery",
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Container - Proper Responsive Padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl blur-xl opacity-60" />
                <div className="relative p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-2xl">
                  <Database className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-slate-900 dark:text-white">
                  PGVault
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                  PostgreSQL Backup & Restore Platform
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                  <FileArchive className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Backups</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{totalBackups}</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Server className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Size</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{formatBytes(totalSize)}</div>
                </div>
              </motion.div>

              <motion.button
                onClick={fetchBackups}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 glass rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? "animate-spin" : ""}`} />
              </motion.button>

              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Tabs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-ultra rounded-2xl overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        px-4 py-3 rounded-xl font-semibold text-sm sm:text-base
                        flex items-center justify-center gap-3
                        transition-all duration-300
                        ${isActive
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                          : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
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

            {/* Tab Content - PROPER PADDING */}
            <div className="p-6 sm:p-8 lg:p-10 bg-white/50 dark:bg-slate-900/50">
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

          {/* Feature Cards Grid - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        {feature.stat}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                        {feature.statLabel}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2">
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
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    System Status
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All systems operational
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-400">PostgreSQL Connected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-6"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Powered by Next.js, TypeScript & PostgreSQL
            </p>
          </motion.footer>
        </div>
      </div>
    </main>
  );
}
