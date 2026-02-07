"use client";

import { BackupTab } from "@/components/BackupTab";
import { HistoryTab } from "@/components/HistoryTab";
import { RestoreTab } from "@/components/RestoreTab";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BackupFile } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Database,
  History,
  Layers,
  RefreshCw,
  RotateCcw,
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
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      id: "restore" as Tab,
      label: "Restore",
      icon: Upload,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    {
      id: "history" as Tab,
      label: "History",
      icon: History,
      gradient: "from-amber-500 via-orange-500 to-red-500",
    },
  ];

  const features = [
    {
      icon: Layers,
      title: "Complete Backup",
      description: "Tables, views, functions, triggers & more",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Streaming with GZIP compression",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Production Ready",
      description: "Enterprise-grade reliability",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: RotateCcw,
      title: "Easy Restore",
      description: "One-click database recovery",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <main className="min-h-screen relative">
      {/* Aurora Mesh Background */}
      <div className="aurora-mesh" />

      {/* Floating Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="ambient-orb w-[600px] h-[600px] bg-indigo-300/30 dark:bg-indigo-600/20 -top-40 -left-40"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="ambient-orb w-[500px] h-[500px] bg-purple-300/25 dark:bg-purple-600/15 top-1/3 -right-40"
          style={{ animationDelay: "8s" }}
        />
        <div
          className="ambient-orb w-[400px] h-[400px] bg-pink-300/20 dark:bg-pink-600/10 bottom-20 left-1/4"
          style={{ animationDelay: "16s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-responsive py-6 md:py-10 lg:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative p-3 md:p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-indigo-500/30">
                <Database className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                <span className="gradient-text-glow">PG</span>
                <span className="text-slate-800 dark:text-white">Vault</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Professional database backup & restore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={fetchBackups}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
              title="Refresh backups"
            >
              <RefreshCw
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? "animate-spin" : ""}`}
              />
            </motion.button>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-ultra rounded-2xl md:rounded-3xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 relative px-4 py-4 md:py-5 transition-colors ${
                        isActive
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                      whileHover={{
                        backgroundColor: "rgba(99, 102, 241, 0.04)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <motion.div
                          className={`p-2 rounded-lg transition-all ${
                            isActive
                              ? `bg-gradient-to-br ${tab.gradient} shadow-lg`
                              : "bg-transparent"
                          }`}
                          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              isActive ? "text-white" : ""
                            }`}
                          />
                        </motion.div>
                        <span className="hidden sm:block text-sm md:text-base font-semibold">
                          {tab.label}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="activeTabLine"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.gradient}`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 lg:p-8 xl:p-10 bg-white/80 dark:bg-slate-900/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
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
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card card-lift p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl group"
              >
                <motion.div
                  className={`inline-flex p-2.5 md:p-3 bg-gradient-to-br ${feature.gradient} rounded-xl mb-3 md:mb-4 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 md:mt-16 pb-6 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Built with Next.js & TypeScript
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
