export interface BackupMetadata {
  backupName: string;
  timestamp: string;
  databaseName: string;
  postgresVersion: string;
  fileSize: number;
  compressed: boolean;
  schemas: string[];
  objectCounts: {
    tables: number;
    views: number;
    sequences: number;
    functions: number;
    triggers: number;
    enums: number;
    extensions: number;
  };
}

export interface BackupOptions {
  connectionString: string;
  backupName: string;
  compress?: boolean;
  schemasOnly?: string[];
  dataOnly?: boolean;
  schemaOnly?: boolean;
}

export interface RestoreOptions {
  connectionString: string;
  backupFile: string;
  clean?: boolean;
  createDatabase?: boolean;
  dataOnly?: boolean;
  schemaOnly?: boolean;
  selectedSchemas?: string[];
}

export interface BackupProgress {
  stage: "connecting" | "schema" | "data" | "finalizing" | "complete";
  message: string;
  progress: number; // 0-100
  currentTable?: string;
}

export interface RestoreProgress {
  stage: "validating" | "cleaning" | "restoring" | "complete";
  message: string;
  progress: number; // 0-100
  statementsExecuted: number;
  totalStatements: number;
}

export interface BackupFile {
  filename: string;
  filepath: string;
  metadata: BackupMetadata;
  createdAt: Date;
  size: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
