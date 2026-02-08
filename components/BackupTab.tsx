"use client";

import { useTranslation } from "@/components/language-provider";
import type { BackupMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Archive,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  Eye,
  FileCode,
  FunctionSquare,
  Hash,
  Key,
  Layers,
  Loader2,
  Settings2,
  Sparkles,
  Table,
  Tags,
  TestTube2,
  Zap,
} from "lucide-react";
import * as React from "react";

interface BackupTabProps {
  onBackupComplete?: (metadata: BackupMetadata) => void;
}

interface ProgressStep {
  name: string;
  status: "pending" | "active" | "complete" | "error";
  icon: React.ElementType;
}

interface ConsoleLogEntry {
  id: number;
  type: "info" | "success" | "warning" | "error" | "active";
  icon: string;
  message: string;
  timestamp: Date;
}

export function BackupTab({ onBackupComplete }: BackupTabProps) {
  const { t } = useTranslation();
  const [connectionString, setConnectionString] = React.useState("");
  const [backupName, setBackupName] = React.useState("");
  const [compress, setCompress] = React.useState(true);
  const [schemaOnly, setSchemaOnly] = React.useState(false);
  const [dataOnly, setDataOnly] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [dbInfo, setDbInfo] = React.useState<any>(null);
  const [progress, setProgress] = React.useState<ProgressStep[]>([]);
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleLogEntry[]>([]);
  const [currentTable, setCurrentTable] = React.useState<string>("");
  const [rowsProcessed, setRowsProcessed] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const consoleEndRef = React.useRef<HTMLDivElement>(null);
  const consoleContainerRef = React.useRef<HTMLDivElement>(null);
  const logIdRef = React.useRef(0);
  const isUserScrolling = React.useRef(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Smart auto-scroll: only scroll the container if user is near the bottom
  React.useEffect(() => {
    const container = consoleContainerRef.current;
    if (!container) return;
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Only auto-scroll if user is near bottom - scroll container only, not the page
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [consoleLogs]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyLogsToClipboard = async () => {
    const logsText = consoleLogs
      .map((log) => `${log.icon} ${log.message}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(logsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy logs:", err);
    }
  };

  const addConsoleLog = (
    type: ConsoleLogEntry["type"],
    icon: string,
    message: string,
  ) => {
    logIdRef.current += 1;
    const uniqueId = Date.now() + logIdRef.current;
    setConsoleLogs((prev) => [
      ...prev,
      { id: uniqueId, type, icon, message, timestamp: new Date() },
    ]);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setDbInfo(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString }),
      });

      const data = await response.json();
      if (data.success) {
        setDbInfo(data.data);
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
      });
      setTesting(false);
    }
  };


  const handleDirectDownload = async () => {
    if (!backupName) {
      setResult({ success: false, message: t.backup.backupNameRequired || "Backup name is required" });
      return;
    }
    
    // We use a separate loading state or just re-use loading but suppress progress?
    // Let's use loading but maybe add a distinct visual state if needed.
    // For now, re-using loading is simplest.
    setLoading(true);
    setResult(null);
    
    try {
        const filename = backupName.endsWith('.sql') ? backupName : `${backupName}.sql`;
        
        const response = await fetch('/api/backup/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                connectionString,
                backupName: filename,
                schemaOnly,
                dataOnly
            })
        });

        if (!response.ok) {
           const data = await response.json();
           throw new Error(data.message || 'Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addConsoleLog("success", "⬇️", t.backup.downloading + " " + filename); // reusing downloading string
        setResult({ success: true, message: "Download started successfully." });

    } catch (e: any) {
        setResult({ success: false, message: e.message });
        addConsoleLog("error", "✗", "Download failed: " + e.message);
    } finally {
        setLoading(false);
    }
  };


  const updateProgressStep = (stageName: string, status: "active" | "complete") => {
    setProgress((prev) =>
      prev.map((step) => {
        const stepNameLower = step.name.toLowerCase();
        const stageNameLower = stageName.toLowerCase();

        if (stepNameLower.includes(stageNameLower) || stageNameLower.includes(stepNameLower)) {
          return { ...step, status };
        }
        return step;
      })
    );
  };

  const initializeProgressSteps = () => {
    const steps: ProgressStep[] = [
      { name: "Connecting", status: "pending", icon: Database },
      { name: "Schemas", status: "pending", icon: Layers },
      { name: "Extensions", status: "pending", icon: Settings2 },
      { name: "Enums", status: "pending", icon: Tags },
      { name: "Sequences", status: "pending", icon: Hash },
      { name: "Tables", status: "pending", icon: Table },
      { name: "Views", status: "pending", icon: Eye },
      { name: "Functions", status: "pending", icon: FunctionSquare },
      { name: "Triggers", status: "pending", icon: Zap },
      { name: "Constraints", status: "pending", icon: Key },
      { name: "Data", status: "pending", icon: FileCode },
      { name: "Writing", status: "pending", icon: Archive },
    ];
    return steps;
  };

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setProgress(initializeProgressSteps());
    setCurrentProgress(0);
    setConsoleLogs([]);
    setCurrentTable("");
    setRowsProcessed(0);

    try {
      const response = await fetch("/api/backup-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString,
          backupName,
          compress,
          schemaOnly,
          dataOnly,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));

              // Update progress bar
              if (event.progress !== undefined) {
                setCurrentProgress(event.progress);
              }

              // Update current table and rows
              if (event.currentTable) {
                setCurrentTable(event.currentTable);
              }
              if (event.rowsProcessed !== undefined) {
                setRowsProcessed(event.rowsProcessed);
              }

              // Update stage indicators
              if (event.stage) {
                updateProgressStep(event.stage, "active");
                if (event.progress >= 95) {
                  updateProgressStep(event.stage, "complete");
                }
              }

              // Add console log
              if (event.message) {
                addConsoleLog(
                  event.logType || "info",
                  event.icon || "ℹ️",
                  event.message
                );
              }

              // Handle completion
              if (event.type === "complete") {
                setResult({ success: true, data: event.result, message: "Backup completed successfully!" });
                addConsoleLog("success", "🎉", "Backup created successfully!");

                // Trigger confetti celebration
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#6366f1', '#8b5cf6', '#d946ef', '#f97316']
                });

                if (onBackupComplete && event.result?.metadata) {
                  onBackupComplete(event.result.metadata);
                }
              }

              // Handle errors
              if (event.type === "error") {
                setResult({ success: false, message: event.message });
                addConsoleLog("error", "✗", `Backup failed: ${event.message}`);
              }
            } catch (parseError) {
              console.error("Failed to parse SSE event:", parseError);
            }
          }
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      });
      addConsoleLog("error", "✗", "Backup operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <motion.div
          className="p-2.5 md:p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/25"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Archive className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {t.backup.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.backup.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleBackup} className="space-y-5 md:space-y-6">
        {/* Connection String */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Database className="w-4 h-4 text-indigo-500" />
            {t.backup.connectionString}
          </label>
          <div className="relative">
            <input
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://user:password@host/database"
              className="input-field w-full px-4 py-3.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t.backup.connectionHelp}
            </p>
            <motion.button
              type="button"
              onClick={handleTestConnection}
              disabled={!connectionString || testing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 self-start sm:self-auto"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.backup.testing}
                </>
              ) : (
                <>
                  <TestTube2 className="w-3.5 h-3.5" />
                  {t.backup.testConnection}
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Connection Success */}
        <AnimatePresence>
          {dbInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="glass-card rounded-xl p-4 md:p-5 border-l-4 border-emerald-500"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg shadow-emerald-500/25"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Connection Successful
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Database",
                        value: dbInfo.databaseName,
                        gradient: false,
                      },
                      {
                        label: "Tables",
                        value: dbInfo.tableCount,
                        gradient: true,
                      },
                      {
                        label: "Schemas",
                        value: dbInfo.schemas?.length || 0,
                        gradient: false,
                      },
                      {
                        label: "Size",
                        value: `${(dbInfo.databaseSize / 1024 / 1024).toFixed(2)} MB`,
                        gradient: false,
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 + 0.15 }}
                        className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg"
                      >
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.label}
                        </div>
                        <div
                          className={cn(
                            "font-bold text-sm",
                            item.gradient
                              ? "gradient-text text-xl"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backup Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <FileCode className="w-4 h-4 text-purple-500" />
            {t.backup.backupName}
          </label>
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="my_database_backup"
            className="input-field w-full px-4 py-3.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            required
          />
        </div>

        {/* Backup Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {t.backup.backupOptions}
          </h3>

          {/* Compression Toggle */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className={cn(
              "glass-card flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
              compress && "ring-2 ring-indigo-500/30 border-indigo-500/30",
            )}
          >
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Archive className="w-4 h-4 text-indigo-500" />
                {t.backup.compression}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                {t.backup.compressionHelp}
              </span>
            </div>
            {compress && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-info"
              >
                {t.backup.recommended}
              </motion.div>
            )}
          </motion.label>

          {/* Schema Only */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className={cn(
              "glass-card flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
              schemaOnly && "ring-2 ring-purple-500/30 border-purple-500/30",
            )}
          >
            <input
              type="checkbox"
              checked={schemaOnly}
              onChange={(e) => {
                setSchemaOnly(e.target.checked);
                if (e.target.checked) setDataOnly(false);
              }}
              className="w-5 h-5 text-purple-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                {t.backup.schemaOnly}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                {t.backup.schemaOnlyHelp}
              </span>
            </div>
          </motion.label>

          {/* Data Only */}
          <motion.label
            whileHover={{ scale: 1.01 }}
            className={cn(
              "glass-card flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
              dataOnly && "ring-2 ring-emerald-500/30 border-emerald-500/30",
            )}
          >
            <input
              type="checkbox"
              checked={dataOnly}
              onChange={(e) => {
                setDataOnly(e.target.checked);
                if (e.target.checked) setSchemaOnly(false);
              }}
              className="w-5 h-5 text-emerald-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-500" />
                {t.backup.dataOnly}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                {t.backup.dataOnlyHelp}
              </span>
            </div>
          </motion.label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="btn-primary w-full py-4 rounded-xl font-bold text-base md:text-lg disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.backup.backingUp}
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                {t.backup.startBackup}
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDirectDownload}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-base md:text-lg disabled:opacity-70 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.backup.downloading}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t.backup.downloadDirect}
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Console-Like Progress */}
      <AnimatePresence>
        {loading && consoleLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Progress Header */}
            <div className="glass-card rounded-xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-50" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Live Progress
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{formatTime(elapsedTime)}</span>
                  </span>
                  <span className="text-2xl font-bold gradient-text">
                    {Math.round(currentProgress)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar h-3 rounded-full">
                <motion.div
                  className="progress-fill h-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Current Table Tracking */}
            <AnimatePresence>
              {currentTable && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Processing: {currentTable}
                      </div>
                      {rowsProcessed > 0 && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {rowsProcessed.toLocaleString()} rows processed
                        </div>
                      )}
                    </div>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Console Output */}
            <div className="console-output">
              <div className="console-header">
                <div className="flex items-center gap-2">
                  <div className="console-dots">
                    <div className="console-dot red" />
                    <div className="console-dot yellow" />
                    <div className="console-dot green" />
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Backup Progress
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={copyLogsToClipboard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
                  title="Copy logs to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
              <div 
                ref={consoleContainerRef}
                className="console-body"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
                  isUserScrolling.current = !isNearBottom;
                }}
              >
                <AnimatePresence>
                  {consoleLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("console-line", log.type)}
                    >
                      <span className="console-icon">{log.icon}</span>
                      <span className="console-text">{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && <span className="console-cursor" />}
                <div ref={consoleEndRef} />
              </div>
            </div>

            {/* Step Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {progress.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "glass-card p-2 rounded-lg text-center transition-all",
                      step.status === "active" &&
                        "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
                      step.status === "complete" &&
                        "bg-emerald-50 dark:bg-emerald-500/10",
                      step.status === "pending" && "opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "mx-auto w-7 h-7 rounded-lg flex items-center justify-center mb-1",
                        step.status === "active" &&
                          "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30",
                        step.status === "complete" &&
                          "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30",
                        step.status === "pending" &&
                          "bg-slate-200 dark:bg-slate-700",
                      )}
                    >
                      {step.status === "active" ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : step.status === "complete" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        step.status === "active" &&
                          "text-indigo-700 dark:text-indigo-300",
                        step.status === "complete" &&
                          "text-emerald-700 dark:text-emerald-300",
                        step.status === "pending" &&
                          "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {step.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "glass-card rounded-xl p-5 md:p-6 border-l-4",
              result.success ? "border-emerald-500" : "border-red-500",
            )}
          >
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  delay: 0.1,
                }}
                className={cn(
                  "p-3 rounded-xl shadow-lg",
                  result.success
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30"
                    : "bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/30",
                )}
              >
                {result.success ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <span className="w-6 h-6 text-white text-center font-bold">
                    ✗
                  </span>
                )}
              </motion.div>

              <div className="flex-1">
                <h4
                  className={cn(
                    "font-bold text-lg mb-1",
                    result.success
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-red-900 dark:text-red-100",
                  )}
                >
                  {result.success ? "🎉 Backup Created!" : "Backup Failed"}
                </h4>
                <p
                  className={cn(
                    "text-sm mb-4",
                    result.success
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-700 dark:text-red-300",
                  )}
                >
                  {result.message}
                </p>

                {result.success && result.data?.metadata && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Tables",
                        value: result.data.metadata.objectCounts.tables,
                      },
                      {
                        label: "Functions",
                        value: result.data.metadata.objectCounts.functions,
                      },
                      {
                        label: "Enums",
                        value: result.data.metadata.objectCounts.enums,
                      },
                      {
                        label: "Size",
                        value: `${(result.data.metadata.fileSize / 1024).toFixed(1)} KB`,
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg"
                      >
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.label}
                        </div>
                        <div className="text-xl font-bold gradient-text">
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
