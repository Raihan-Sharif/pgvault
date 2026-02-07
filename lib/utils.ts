import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function validateConnectionString(connectionString: string): {
  valid: boolean;
  error?: string;
} {
  if (!connectionString) {
    return { valid: false, error: "Connection string is required" };
  }

  if (
    !connectionString.startsWith("postgresql://") &&
    !connectionString.startsWith("postgres://")
  ) {
    return {
      valid: false,
      error: "Connection string must start with postgresql:// or postgres://",
    };
  }

  // Basic format validation
  try {
    const url = new URL(connectionString);
    if (!url.hostname) {
      return { valid: false, error: "Invalid hostname in connection string" };
    }
    if (!url.pathname || url.pathname === "/") {
      return {
        valid: false,
        error: "Database name is required in connection string",
      };
    }
  } catch (e) {
    return { valid: false, error: "Invalid connection string format" };
  }

  return { valid: true };
}

export function validateBackupName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name) {
    return { valid: false, error: "Backup name is required" };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return {
      valid: false,
      error:
        "Backup name can only contain letters, numbers, underscores, and hyphens",
    };
  }

  if (name.length > 100) {
    return {
      valid: false,
      error: "Backup name must be less than 100 characters",
    };
  }

  return { valid: true };
}

export function sanitizeSQL(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (typeof value === "object") {
    // Handle arrays and JSON objects
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  if (typeof value === "string") {
    // Escape single quotes
    return `'${value.replace(/'/g, "''")}'`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}
