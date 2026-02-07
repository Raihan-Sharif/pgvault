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

async function restoreBackup(connectionString, backupFilePath, options = {}) {
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

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected successfully!");

    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }

    // Read backup file
    console.log("📖 Reading backup file...");
    let sqlContent;

    if (backupFilePath.endsWith(".gz")) {
      const compressed = fs.readFileSync(backupFilePath);
      sqlContent = zlib.gunzipSync(compressed).toString("utf8");
    } else {
      sqlContent = fs.readFileSync(backupFilePath, "utf8");
    }

    // Parse SQL statements
    console.log("🔍 Parsing SQL statements...");
    const statements = parseSQLStatements(sqlContent);
    console.log(`📊 Found ${statements.length} SQL statements`);

    // Filter statements based on options
    let filteredStatements = statements;

    if (dataOnly) {
      filteredStatements = statements.filter(
        (stmt) =>
          stmt.toUpperCase().trim().startsWith("INSERT") ||
          stmt.toUpperCase().trim().startsWith("COPY"),
      );
      console.log(
        `📊 Filtered to ${filteredStatements.length} data statements`,
      );
    }

    if (schemaOnly) {
      filteredStatements = statements.filter(
        (stmt) =>
          !stmt.toUpperCase().trim().startsWith("INSERT") &&
          !stmt.toUpperCase().trim().startsWith("COPY"),
      );
      console.log(
        `📊 Filtered to ${filteredStatements.length} schema statements`,
      );
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
      console.log(
        `📊 Filtered to ${filteredStatements.length} statements for schemas: ${selectedSchemas.join(", ")}`,
      );
    }

    // Clean database if requested
    if (clean) {
      console.log("🧹 Cleaning existing objects...");
      await cleanDatabase(client, selectedSchemas);
    }

    // Execute statements
    console.log("⚡ Executing restore...");
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

        if ((i + 1) % 100 === 0) {
          console.log(
            `  ⏳ Progress: ${i + 1}/${filteredStatements.length} statements executed`,
          );
        }
      } catch (error) {
        errorCount++;
        errors.push({
          statement: stmt.substring(0, 100) + "...",
          error: error.message,
        });

        // Continue on error for most statements, but log them
        if (errorCount <= 10) {
          console.warn(`  ⚠️  Warning: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Restore completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Successful: ${successCount} statements`);
    console.log(`   - Errors: ${errorCount} statements`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.error}`);
        console.log(`      Statement: ${err.statement}`);
      });
    } else if (errors.length > 10) {
      console.log(
        `\n⚠️  ${errors.length} errors encountered (showing first 10)`,
      );
      errors.slice(0, 10).forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.error}`);
      });
    }

    return {
      success: true,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    };
  } catch (error) {
    console.error("❌ Restore failed:", error.message);
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
async function cleanDatabase(client, selectedSchemas = null) {
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
      console.log(`  🧹 Cleaning schema: ${schema}`);

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

    console.log("  ✅ Database cleaned");
  } catch (error) {
    console.warn(`  ⚠️  Error during cleanup: ${error.message}`);
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
