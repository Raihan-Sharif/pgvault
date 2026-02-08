#!/usr/bin/env node

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/**
 * Professional PostgreSQL Restore Script
 * Restores databases from SQL backup files
 * Serverless-compatible (no pg_restore required)
 */

async function restoreBackup(connectionString, backupFilePath, options = {}, progressCallback = null) {
  const {
    clean = false,
    dataOnly = false,
    schemaOnly = false,
    selectedSchemas = null,
  } = options;

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Helper to emit progress events
  const emit = (event) => {
    if (progressCallback) {
      progressCallback(event);
    } else {
      // Fallback to console.log for CLI usage
      if (event.message) {
        console.log(`${event.icon || ''} ${event.message}`);
      }
    }
  };

  try {
    emit({ type: 'log', stage: 'connecting', icon: '🔌', message: 'Connecting to database...', logType: 'info', progress: 0 });
    await client.connect();
    emit({ type: 'log', stage: 'connecting', icon: '✅', message: 'Connected successfully!', logType: 'success', progress: 5 });

    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }

    // Read backup file
    emit({ type: 'log', stage: 'reading', icon: '📖', message: 'Reading backup file...', logType: 'info', progress: 10 });
    let sqlContent;

    if (backupFilePath.endsWith(".gz")) {
      emit({ type: 'log', stage: 'reading', icon: '📦', message: 'Decompressing backup file...', logType: 'info', progress: 12 });
      const compressed = fs.readFileSync(backupFilePath);
      sqlContent = zlib.gunzipSync(compressed).toString("utf8");
    } else {
      sqlContent = fs.readFileSync(backupFilePath, "utf8");
    }

    const fileSize = (sqlContent.length / 1024).toFixed(2);
    emit({ type: 'log', stage: 'reading', icon: '✅', message: `File read: ${fileSize} KB`, logType: 'success', progress: 15 });

    // Parse SQL statements
    emit({ type: 'log', stage: 'parsing', icon: '🔍', message: 'Parsing SQL statements...', logType: 'info', progress: 18 });
    const statements = parseSQLStatements(sqlContent);
    emit({ type: 'log', stage: 'parsing', icon: '📊', message: `Found ${statements.length} SQL statements`, logType: 'success', progress: 20 });

    // Filter statements based on options
    let filteredStatements = statements;

    if (dataOnly) {
      filteredStatements = statements.filter(
        (stmt) =>
          stmt.toUpperCase().trim().startsWith("INSERT") ||
          stmt.toUpperCase().trim().startsWith("COPY"),
      );
      emit({ type: 'log', stage: 'filtering', icon: '📊', message: `Filtered to ${filteredStatements.length} data statements`, logType: 'info', progress: 22 });
    }

    if (schemaOnly) {
      filteredStatements = statements.filter(
        (stmt) =>
          !stmt.toUpperCase().trim().startsWith("INSERT") &&
          !stmt.toUpperCase().trim().startsWith("COPY"),
      );
      emit({ type: 'log', stage: 'filtering', icon: '📊', message: `Filtered to ${filteredStatements.length} schema statements`, logType: 'info', progress: 22 });
    }

    if (selectedSchemas && selectedSchemas.length > 0) {
      filteredStatements = statements.filter((stmt) => {
        return selectedSchemas.some(
          (schema) =>
            stmt.includes(`${schema}.`) ||
            stmt.includes(`SCHEMA ${schema}`) ||
            stmt.includes(`SCHEMA IF NOT EXISTS ${schema}`),
        );
      });
      emit({ type: 'log', stage: 'filtering', icon: '📊', message: `Filtered to ${filteredStatements.length} statements for schemas: ${selectedSchemas.join(", ")}`, logType: 'info', progress: 22 });
    }

    // Clean database if requested
    if (clean) {
      emit({ type: 'log', stage: 'cleaning', icon: '🧹', message: 'Cleaning existing objects...', logType: 'info', progress: 25 });
      await cleanDatabase(client, selectedSchemas, emit);
    }

    // Execute statements
    emit({ type: 'log', stage: 'executing', icon: '⚡', message: 'Executing restore...', logType: 'info', progress: 30 });
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < filteredStatements.length; i++) {
      const stmt = filteredStatements[i];

      if (!stmt.trim() || stmt.trim().startsWith("--")) {
        continue;
      }

      try {
        await client.query(stmt);
        successCount++;

        // Calculate progress (30% to 95% range)
        const progress = 30 + Math.round(((i + 1) / filteredStatements.length) * 65);

        if ((i + 1) % 50 === 0 || i === 0) {
          const stmtPreview = stmt.substring(0, 80).replace(/\n/g, ' ');
          emit({
            type: 'log',
            stage: 'executing',
            icon: '⏳',
            message: `Progress: ${i + 1}/${filteredStatements.length} statements executed`,
            logType: 'info',
            progress,
            statementsExecuted: i + 1,
            totalStatements: filteredStatements.length,
            currentStatement: stmtPreview
          });
        }
      } catch (error) {
        errorCount++;
        errors.push({
          statement: stmt.substring(0, 100) + "...",
          error: error.message,
        });

        // Emit error in real-time
        if (errorCount <= 5) {
          emit({
            type: 'log',
            stage: 'executing',
            icon: '⚠️',
            message: `Warning: ${error.message}`,
            logType: 'warning',
            progress: 30 + Math.round(((i + 1) / filteredStatements.length) * 65)
          });
        }
      }
    }

    emit({ type: 'log', stage: 'complete', icon: '✅', message: 'Restore completed!', logType: 'success', progress: 98 });
    emit({ type: 'log', stage: 'complete', icon: '📊', message: `Successful: ${successCount} statements`, logType: 'info', progress: 100 });
    emit({ type: 'log', stage: 'complete', icon: '📊', message: `Errors: ${errorCount} statements`, logType: errorCount > 0 ? 'warning' : 'info', progress: 100 });

    if (errors.length > 0 && errors.length <= 10) {
      emit({ type: 'log', stage: 'complete', icon: '⚠️', message: `${errors.length} error(s) encountered`, logType: 'warning', progress: 100 });
      errors.forEach((err, idx) => {
        emit({ type: 'log', stage: 'complete', icon: '  -', message: `${err.error}`, logType: 'warning', progress: 100 });
      });
    } else if (errors.length > 10) {
      emit({ type: 'log', stage: 'complete', icon: '⚠️', message: `${errors.length} error(s) encountered (showing first 10)`, logType: 'warning', progress: 100 });
      errors.slice(0, 10).forEach((err, idx) => {
        emit({ type: 'log', stage: 'complete', icon: '  -', message: `${err.error}`, logType: 'warning', progress: 100 });
      });
    }

    const result = {
      success: true,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    };

    emit({
      type: 'complete',
      stage: 'complete',
      progress: 100,
      result
    });

    return result;
  } catch (error) {
    emit({ type: 'error', stage: 'error', icon: '❌', message: `Restore failed: ${error.message}`, logType: 'error', progress: 0 });
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Parse SQL content into individual statements
 */
function parseSQLStatements(sqlContent) {
  const statements = [];
  let currentStatement = "";
  let inString = false;
  let stringChar = null;
  let inComment = false;
  let inMultilineComment = false;

  const lines = sqlContent.split("\n");

  for (let line of lines) {
    // Skip single-line comments at the start of the line
    if (line.trim().startsWith("--") && !inString) {
      continue;
    }

    // Handle multiline comments
    if (line.includes("/*") && !inString) {
      inMultilineComment = true;
    }
    if (line.includes("*/") && inMultilineComment) {
      inMultilineComment = false;
      continue;
    }
    if (inMultilineComment) {
      continue;
    }

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : null;

      // Handle strings
      if ((char === "'" || char === '"') && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          // Check for escaped quotes (doubled quotes)
          if (line[i + 1] === stringChar) {
            currentStatement += char;
            i++; // Skip next char
            continue;
          }
          inString = false;
          stringChar = null;
        }
      }

      currentStatement += char;

      // Check for statement terminator
      if (char === ";" && !inString) {
        const stmt = currentStatement.trim();
        if (stmt && stmt !== ";") {
          statements.push(stmt);
        }
        currentStatement = "";
      }
    }

    currentStatement += "\n";
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

/**
 * Clean database by dropping existing objects
 */
async function cleanDatabase(client, selectedSchemas = null, emit = null) {
  try {
    // Get schemas to clean
    const schemasQuery =
      selectedSchemas && selectedSchemas.length > 0
        ? `SELECT schema_name FROM information_schema.schemata WHERE schema_name = ANY($1)`
        : `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')`;

    const schemasResult = await client.query(
      schemasQuery,
      selectedSchemas && selectedSchemas.length > 0 ? [selectedSchemas] : [],
    );

    for (const schemaRow of schemasResult.rows) {
      const schema = schemaRow.schema_name;
      if (emit) {
        emit({ type: 'log', stage: 'cleaning', icon: '🧹', message: `Cleaning schema: ${schema}`, logType: 'info', progress: 25 });
      } else {
        console.log(`  🧹 Cleaning schema: ${schema}`);
      }

      // Drop all tables in schema
      const tablesResult = await client.query(
        `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1 AND table_type = 'BASE TABLE'
      `,
        [schema],
      );

      for (const tableRow of tablesResult.rows) {
        try {
          await client.query(
            `DROP TABLE IF EXISTS ${schema}.${tableRow.table_name} CASCADE`,
          );
        } catch (e) {
          console.warn(
            `    ⚠️  Could not drop table ${schema}.${tableRow.table_name}: ${e.message}`,
          );
        }
      }

      // Drop all views
      const viewsResult = await client.query(
        `
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = $1
      `,
        [schema],
      );

      for (const viewRow of viewsResult.rows) {
        try {
          await client.query(
            `DROP VIEW IF EXISTS ${schema}.${viewRow.table_name} CASCADE`,
          );
        } catch (e) {
          console.warn(
            `    ⚠️  Could not drop view ${schema}.${viewRow.table_name}: ${e.message}`,
          );
        }
      }

      // Drop all sequences
      const seqResult = await client.query(
        `
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = $1
      `,
        [schema],
      );

      for (const seqRow of seqResult.rows) {
        try {
          await client.query(
            `DROP SEQUENCE IF EXISTS ${schema}.${seqRow.sequence_name} CASCADE`,
          );
        } catch (e) {
          console.warn(
            `    ⚠️  Could not drop sequence ${schema}.${seqRow.sequence_name}: ${e.message}`,
          );
        }
      }

      // Drop all functions
      const funcResult = await client.query(
        `
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = $1
      `,
        [schema],
      );

      for (const funcRow of funcResult.rows) {
        try {
          await client.query(
            `DROP FUNCTION IF EXISTS ${schema}.${funcRow.proname}(${funcRow.args}) CASCADE`,
          );
        } catch (e) {
          console.warn(
            `    ⚠️  Could not drop function ${schema}.${funcRow.proname}: ${e.message}`,
          );
        }
      }
    }

    if (emit) {
      emit({ type: 'log', stage: 'cleaning', icon: '✅', message: 'Database cleaned', logType: 'success', progress: 28 });
    } else {
      console.log("  ✅ Database cleaned");
    }
  } catch (error) {
    if (emit) {
      emit({ type: 'log', stage: 'cleaning', icon: '⚠️', message: `Error during cleanup: ${error.message}`, logType: 'warning', progress: 28 });
    } else {
      console.warn(`  ⚠️  Error during cleanup: ${error.message}`);
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: node restore.js <connection_string> <backup_file> [--clean] [--data-only] [--schema-only]",
    );
    console.log(
      'Example: node restore.js "postgresql://user:pass@host/db" ./backups/my_backup.sql --clean',
    );
    process.exit(1);
  }

  const [connectionString, backupFile, ...flags] = args;
  const options = {
    clean: flags.includes("--clean"),
    dataOnly: flags.includes("--data-only"),
    schemaOnly: flags.includes("--schema-only"),
  };

  restoreBackup(connectionString, backupFile, options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { restoreBackup };
