"use client";

import { useTranslation } from "@/components/language-provider";
import type { BackupFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Database,
  Eye,
  FileCode,
  FunctionSquare,
  Hash,
  Key,
  Layers,
  Loader2,
  RotateCcw,
  Table,
  Trash2,
  Upload,
  Zap
} from "lucide-react";
import * as React from "react";

interface RestoreTabProps {
  backupFiles: BackupFile[];
  onRestoreComplete?: () => void;
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
}

export function RestoreTab({
  backupFiles,
  onRestoreComplete,
}: RestoreTabProps) {
  const { t } = useTranslation();
  const [connectionString, setConnectionString] = React.useState("");
  const [selectedBackup, setSelectedBackup] = React.useState("");
  const [cleanDatabase, setCleanDatabase] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [progress, setProgress] = React.useState<ProgressStep[]>([]);
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleLogEntry[]>([]);
  const [currentStatement, setCurrentStatement] = React.useState<string>("");
  const [statementsExecuted, setStatementsExecuted] = React.useState<number>(0);
  const [totalStatements, setTotalStatements] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const consoleEndRef = React.useRef<HTMLDivElement>(null);
  const consoleContainerRef = React.useRef<HTMLDivElement>(null);
  const logIdRef = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const selectedBackupData = backupFiles.find(
    (b) => b.filename === selectedBackup,
  );

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
      { id: uniqueId, type, icon, message },
    ]);
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
      { name: "Reading", status: "pending", icon: Upload },
      { name: "Parsing", status: "pending", icon: Code2 },
      { name: "Cleaning", status: "pending", icon: Trash2 },
      { name: "Schemas", status: "pending", icon: Layers },
      { name: "Tables", status: "pending", icon: Table },
      { name: "Sequences", status: "pending", icon: Hash },
      { name: "Views", status: "pending", icon: Eye },
      { name: "Functions", status: "pending", icon: FunctionSquare },
      { name: "Triggers", status: "pending", icon: Zap },
      { name: "Constraints", status: "pending", icon: Key },
      { name: "Complete", status: "pending", icon: CheckCircle2 },
    ];
    return steps;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        if (onRestoreComplete) onRestoreComplete();
        setTimeout(() => setSelectedBackup(data.filename), 1000);
        addConsoleLog("success", "✅", t.restore.uploadSuccess);
      } else {
        addConsoleLog("error", "✗", data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed", error);
      addConsoleLog("error", "✗", "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setProgress(initializeProgressSteps());
    setCurrentProgress(0);
    setConsoleLogs([]);
    setCurrentStatement("");
    setStatementsExecuted(0);
    setTotalStatements(0);

    try {
      const response = await fetch("/api/restore-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString,
          backupFile: selectedBackup,
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

              // Update current statement and counts
              if (event.currentStatement) {
                setCurrentStatement(event.currentStatement);
              }
              if (event.statementsExecuted !== undefined) {
                setStatementsExecuted(event.statementsExecuted);
              }
              if (event.totalStatements !== undefined) {
                setTotalStatements(event.totalStatements);
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
                setResult({ success: true, data: event.result, message: "Restore completed successfully!" });
                addConsoleLog("success", "🎉", "Database restored successfully!");

                // Trigger confetti celebration
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6']
                });

                if (onRestoreComplete) {
                  onRestoreComplete();
                }
              }

              // Handle errors
              if (event.type === "error") {
                setResult({ success: false, message: event.message });
                addConsoleLog("error", "✗", `Restore failed: ${event.message}`);
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
      addConsoleLog("error", "✗", "Restore operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <motion.div
          className="p-2.5 md:p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/25"
          whileHover={{ scale: 1.05, rotate: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Upload className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {t.restore.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.restore.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleRestore} className="space-y-5 md:space-y-6">
        {/* Connection String */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Database className="w-4 h-4 text-emerald-500" />
            {t.restore.targetConnection}
          </label>
          <input
            type="text"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgresql://user:password@host/database"
            className="input-field w-full px-4 py-3.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.restore.targetHelp}
          </p>
        </div>

        {/* Select Backup */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Archive className="w-4 h-4 text-purple-500" />
            {t.restore.selectBackup}
          </label>
          {backupFiles.length > 0 ? (
            <select
              value={selectedBackup}
              onChange={(e) => setSelectedBackup(e.target.value)}
              className="input-field w-full px-4 py-3.5 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-800 cursor-pointer"
              required
            >
              <option value="">{t.restore.selectBackupPlaceholder}</option>
              {backupFiles.map((file) => (
                <option key={file.filename} value={file.filename}>
                  {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                </option>
              ))}
            </select>
          ) : (
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto mb-3">
                <Archive className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.restore.noBackups}
              </p>
            </div>
          )}
        </div>

        {/* Upload Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 font-medium">
              {t.restore.orUpload}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".sql,.gz"
            className="hidden"
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? t.restore.uploading : t.restore.uploadBackup}
          </motion.button>
        </div>

        {/* Selected Backup Info */}
        <AnimatePresence>
          {selectedBackupData?.metadata && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-xl p-4 md:p-5 border-l-4 border-indigo-500"
            >
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                {t.details.title}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "Tables",
                    value:
                      selectedBackupData.metadata.objectCounts?.tables || 0,
                    gradient: true,
                  },
                  {
                    label: "Functions",
                    value:
                      selectedBackupData.metadata.objectCounts?.functions || 0,
                    gradient: true,
                  },
                  {
                    label: "Views",
                    value: selectedBackupData.metadata.objectCounts?.views || 0,
                    color: "emerald",
                  },
                  {
                    label: "Size",
                    value: `${(selectedBackupData.size / 1024).toFixed(1)} KB`,
                    color: "amber",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "text-xl font-bold",
                        item.gradient
                          ? "gradient-text"
                          : item.color === "emerald"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {item.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Database Toggle */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={cn(
            "glass-card rounded-xl p-4 cursor-pointer transition-all",
            cleanDatabase && "ring-2 ring-amber-400/50 border-amber-400/30",
          )}
        >
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={cleanDatabase}
              onChange={(e) => setCleanDatabase(e.target.checked)}
              className="mt-1 w-5 h-5 text-amber-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-500" />
                {t.restore.cleanDatabase}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">
                {t.restore.cleanDatabaseHelp}
              </span>
            </div>
          </label>

          <AnimatePresence>
            {cleanDatabase && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {t.restore.cleanWarning}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !selectedBackup}
          whileHover={{
            scale: loading || !selectedBackup ? 1 : 1.02,
            y: loading || !selectedBackup ? 0 : -2,
          }}
          whileTap={{ scale: loading || !selectedBackup ? 1 : 0.98 }}
          className="w-full py-4 rounded-xl font-bold text-base md:text-lg text-white disabled:opacity-70 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.restore.restoring}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <RotateCcw className="w-5 h-5" />
              {t.restore.startRestore}
            </span>
          )}
        </motion.button>
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
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Restore Progress
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{formatTime(elapsedTime)}</span>
                  </span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(currentProgress)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar h-3 rounded-full">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Current Statement Tracking */}
            <AnimatePresence>
              {totalStatements > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Executing SQL statements: {statementsExecuted.toLocaleString()} / {totalStatements.toLocaleString()}
                      </div>
                      {currentStatement && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono truncate">
                          {currentStatement}
                        </div>
                      )}
                    </div>
                    <RotateCcw className="w-4 h-4 text-cyan-500" />
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
                    Restore Progress
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
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-13 gap-2">
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
                        "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
                      step.status === "complete" &&
                        "bg-emerald-50 dark:bg-emerald-500/10",
                      step.status === "pending" && "opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "mx-auto w-7 h-7 rounded-lg flex items-center justify-center mb-1",
                        step.status === "active" &&
                          "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30",
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
                          "text-emerald-700 dark:text-emerald-300",
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
                  {result.success ? "🎉 Restore Complete!" : "Restore Failed"}
                </h4>
                <p
                  className={cn(
                    "text-sm",
                    result.success
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-700 dark:text-red-300",
                  )}
                >
                  {result.message}
                </p>

                {result.success && result.data && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg"
                    >
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Statements Executed
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {result.data.successCount || 0}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg"
                    >
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Duration
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatTime(elapsedTime)}
                      </div>
                    </motion.div>
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
