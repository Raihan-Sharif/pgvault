"use client";

import { useTranslation } from "@/components/language-provider";
import type { BackupFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Database,
  Download,
  Eye,
  FileCode,
  FunctionSquare,
  HardDrive,
  Hash,
  History,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  Server,
  Sparkles,
  Table,
  Tags,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";

interface HistoryTabProps {
  backupFiles: BackupFile[];
  onRefresh: () => void;
}

interface DeleteModalProps {
  filename: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

interface InfoModalProps {
  file: BackupFile;
  onClose: () => void;
}

function DeleteModal({
  filename,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl shadow-lg shadow-red-500/30">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Delete Backup?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 dark:text-white">
                {filename}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-800 dark:text-red-300">
                This will permanently remove the backup file from your system.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoModal({ file, onClose }: InfoModalProps) {
  const [copied, setCopied] = React.useState(false);
  const metadata = file.metadata;

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const copyFilename = async () => {
    try {
      await navigator.clipboard.writeText(file.filename);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-card rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Backup Details
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {file.filename}
              </p>
              <button
                onClick={copyFilename}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Copy filename"
              >
                <Copy className={cn("w-3.5 h-3.5", copied ? "text-emerald-500" : "text-slate-400")} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-medium">Size</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatSize(file.size)}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Created</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {new Date(file.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Archive className="w-4 h-4" />
              <span className="text-xs font-medium">Compression</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {file.filename.endsWith('.gz') ? 'GZIP' : 'None'}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">Database</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {metadata?.databaseName || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Full Date/Time */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Backup Created
            </span>
          </div>
          <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium">
            {formatDate(file.createdAt)}
          </p>
        </div>

        {/* Object Counts */}
        {metadata?.objectCounts && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-500" />
              Database Objects
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { icon: Table, value: metadata.objectCounts.tables || 0, label: "Tables", color: "indigo" },
                { icon: Eye, value: metadata.objectCounts.views || 0, label: "Views", color: "emerald" },
                { icon: FunctionSquare, value: metadata.objectCounts.functions || 0, label: "Functions", color: "violet" },
                { icon: Zap, value: metadata.objectCounts.triggers || 0, label: "Triggers", color: "rose" },
                { icon: Hash, value: metadata.objectCounts.sequences || 0, label: "Sequences", color: "blue" },
                { icon: Tags, value: metadata.objectCounts.enums || 0, label: "Enums", color: "amber" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-slate-800 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-700"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2",
                      color === "indigo" && "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                      color === "violet" && "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
                      color === "emerald" && "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                      color === "blue" && "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                      color === "amber" && "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                      color === "rose" && "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schemas */}
        {metadata?.schemas && metadata.schemas.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-500" />
              Schemas Included
            </h4>
            <div className="flex flex-wrap gap-2">
              {metadata.schemas.map((schema: string) => (
                <span
                  key={schema}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                >
                  {schema}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PostgreSQL Version */}
        {metadata?.postgresVersion && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">PostgreSQL Version</span>
            </div>
            <p className="text-sm text-slate-900 dark:text-white font-mono">
              {metadata.postgresVersion}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HistoryTab({ backupFiles, onRefresh }: HistoryTabProps) {
  const { t } = useTranslation();
  const [deletingFile, setDeletingFile] = React.useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = React.useState<string | null>(null);
  const [expandedFile, setExpandedFile] = React.useState<string | null>(null);
  const [deleteModalFile, setDeleteModalFile] = React.useState<string | null>(null);
  const [infoModalFile, setInfoModalFile] = React.useState<BackupFile | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDelete = async () => {
    if (!deleteModalFile) return;

    setDeletingFile(deleteModalFile);
    try {
      const response = await fetch(
        `/api/backups?filename=${encodeURIComponent(deleteModalFile)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: "success",
          message: "Backup deleted successfully!",
        });
        onRefresh();
      } else {
        setNotification({
          type: "error",
          message: data.message || "Failed to delete backup",
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setNotification({ type: "error", message: "Failed to delete backup" });
    } finally {
      setDeletingFile(null);
      setDeleteModalFile(null);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      const link = document.createElement("a");
      link.href = `/api/backups/${encodeURIComponent(filename)}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setNotification({ type: "success", message: "Download started!" });
    } catch (error) {
      console.error("Download failed:", error);
      setNotification({ type: "error", message: "Failed to download backup" });
    } finally {
      setTimeout(() => setDownloadingFile(null), 1000);
    }
  };

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const totalSize = backupFiles.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg",
              notification.type === "success"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
            )}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalFile && (
          <DeleteModal
            filename={deleteModalFile}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModalFile(null)}
            isDeleting={deletingFile === deleteModalFile}
          />
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {infoModalFile && (
          <InfoModal
            file={infoModalFile}
            onClose={() => setInfoModalFile(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.div
            className="p-2.5 md:p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-lg shadow-amber-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <History className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {t.history.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {backupFiles.length} {t.history.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {backupFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card px-4 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.history.totalSize}:
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {formatSize(totalSize)}
              </span>
            </motion.div>
          )}
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 glass rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-5 h-5 text-slate-600 dark:text-slate-400", refreshing && "animate-spin")} />
          </motion.button>
        </div>
      </div>

      {/* Backup List */}
      {backupFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 md:p-12 text-center"
        >
          <motion.div
            className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl w-fit mx-auto mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Archive className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </motion.div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
            {t.history.noBackups}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Create your first backup in the "Create Backup" tab to get started
            with secure database backups.
          </p>
          <motion.div
            className="mt-6 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Switch to Create Backup tab
            </span>
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          <AnimatePresence>
            {backupFiles.map((file, index) => {
              const isExpanded = expandedFile === file.filename;
              const metadata = file.metadata;

              return (
                <motion.div
                  key={file.filename}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="glass-card rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors"
                >
                  {/* Main Row */}
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* File Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <motion.div
                          className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex-shrink-0 shadow-lg shadow-indigo-500/25"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <FileCode className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">
                            {metadata?.backupName || file.filename}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(file.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {formatSize(file.size)}
                            </span>
                            {file.filename.endsWith('.gz') && (
                              <span className="badge badge-info">GZIP</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid (Desktop) */}
                      {metadata?.objectCounts && (
                        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                          {[
                            { icon: Table, value: metadata.objectCounts.tables || 0, label: "Tables" },
                            { icon: FunctionSquare, value: metadata.objectCounts.functions || 0, label: "Funcs" },
                            { icon: Eye, value: metadata.objectCounts.views || 0, label: "Views" },
                            { icon: Hash, value: metadata.objectCounts.sequences || 0, label: "Seqs" },
                            { icon: Zap, value: metadata.objectCounts.triggers || 0, label: "Trigs" },
                          ].map(({ icon: Icon, value, label }) => (
                            <div
                              key={label}
                              className="bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 rounded-lg text-center min-w-[50px]"
                            >
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          onClick={() => setInfoModalFile(file)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all border border-indigo-200 dark:border-indigo-800"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDownload(file.filename)}
                          disabled={downloadingFile === file.filename}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="icon-btn icon-btn-success disabled:opacity-50"
                          title="Download"
                        >
                          {downloadingFile === file.filename ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => setDeleteModalFile(file.filename)}
                          disabled={deletingFile === file.filename}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="icon-btn icon-btn-danger disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingFile === file.filename ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => setExpandedFile(isExpanded ? null : file.filename)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors md:hidden"
                          title="Expand"
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </motion.button>
                      </div>
                    </div>

                    {/* Stats Grid (Mobile - Expanded) */}
                    <AnimatePresence>
                      {isExpanded && metadata?.objectCounts && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { icon: Table, value: metadata.objectCounts.tables || 0, label: "Tables", color: "indigo" },
                              { icon: FunctionSquare, value: metadata.objectCounts.functions || 0, label: "Functions", color: "violet" },
                              { icon: Eye, value: metadata.objectCounts.views || 0, label: "Views", color: "emerald" },
                              { icon: Hash, value: metadata.objectCounts.sequences || 0, label: "Sequences", color: "blue" },
                              { icon: Tags, value: metadata.objectCounts.enums || 0, label: "Enums", color: "amber" },
                              { icon: Zap, value: metadata.objectCounts.triggers || 0, label: "Triggers", color: "rose" },
                            ].map(({ icon: Icon, value, label, color }) => (
                              <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg text-center"
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1",
                                    color === "indigo" && "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                                    color === "violet" && "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
                                    color === "emerald" && "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                                    color === "blue" && "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                                    color === "amber" && "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                                    color === "rose" && "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
                              </motion.div>
                            ))}
                          </div>

                          {metadata.databaseName && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Database className="w-3.5 h-3.5" />
                              <span>
                                Database:{" "}
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {metadata.databaseName}
                                </strong>
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
