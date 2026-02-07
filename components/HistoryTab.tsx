"use client";

import type { BackupFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  Eye,
  FileCode,
  FunctionSquare,
  Hash,
  History,
  Layers,
  Loader2,
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

export function HistoryTab({ backupFiles, onRefresh }: HistoryTabProps) {
  const [deletingFile, setDeletingFile] = React.useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = React.useState<string | null>(
    null,
  );
  const [expandedFile, setExpandedFile] = React.useState<string | null>(null);
  const [deleteModalFile, setDeleteModalFile] = React.useState<string | null>(
    null,
  );
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

  const handleDelete = async () => {
    if (!deleteModalFile) return;

    setDeletingFile(deleteModalFile);
    try {
      const response = await fetch(
        `/api/backups?filename=${encodeURIComponent(deleteModalFile)}`,
        {
          method: "DELETE",
        },
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
      // Use window.location to trigger download
      const link = document.createElement("a");
      link.href = `/backups/${encodeURIComponent(filename)}`;
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
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
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
                : "bg-gradient-to-r from-red-500 to-rose-500 text-white",
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
              Backup History
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {backupFiles.length} backup{backupFiles.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        {backupFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card px-4 py-2.5 rounded-xl inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Total:
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {formatSize(totalSize)}
            </span>
          </motion.div>
        )}
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
            No Backups Yet
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
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
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
                            {metadata?.compressed && (
                              <span className="badge badge-info">GZIP</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid (Desktop) */}
                      {metadata?.objectCounts && (
                        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                          {[
                            {
                              icon: Table,
                              value: metadata.objectCounts.tables || 0,
                              label: "Tables",
                            },
                            {
                              icon: FunctionSquare,
                              value: metadata.objectCounts.functions || 0,
                              label: "Funcs",
                            },
                            {
                              icon: Eye,
                              value: metadata.objectCounts.views || 0,
                              label: "Views",
                            },
                            {
                              icon: Hash,
                              value: metadata.objectCounts.sequences || 0,
                              label: "Seqs",
                            },
                            {
                              icon: Zap,
                              value: metadata.objectCounts.triggers || 0,
                              label: "Trigs",
                            },
                          ].map(({ icon: Icon, value, label }) => (
                            <div
                              key={label}
                              className="bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 rounded-lg text-center min-w-[50px]"
                            >
                              <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {value}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                          onClick={() =>
                            setExpandedFile(isExpanded ? null : file.filename)
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors md:hidden"
                          title="Expand"
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded && "rotate-180",
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
                              {
                                icon: Table,
                                value: metadata.objectCounts.tables || 0,
                                label: "Tables",
                                color: "indigo",
                              },
                              {
                                icon: FunctionSquare,
                                value: metadata.objectCounts.functions || 0,
                                label: "Functions",
                                color: "violet",
                              },
                              {
                                icon: Eye,
                                value: metadata.objectCounts.views || 0,
                                label: "Views",
                                color: "emerald",
                              },
                              {
                                icon: Hash,
                                value: metadata.objectCounts.sequences || 0,
                                label: "Sequences",
                                color: "blue",
                              },
                              {
                                icon: Tags,
                                value: metadata.objectCounts.enums || 0,
                                label: "Enums",
                                color: "amber",
                              },
                              {
                                icon: Zap,
                                value: metadata.objectCounts.triggers || 0,
                                label: "Triggers",
                                color: "rose",
                              },
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
                                    color === "indigo" &&
                                      "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                                    color === "violet" &&
                                      "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
                                    color === "emerald" &&
                                      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                                    color === "blue" &&
                                      "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                                    color === "amber" &&
                                      "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                                    color === "rose" &&
                                      "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">
                                  {value}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {label}
                                </div>
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
