import { validateConnectionString } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest) {
  let client: Client | null = null;

  try {
    const body = await request.json();
    const { connectionString } = body;

    if (!connectionString) {
      return NextResponse.json(
        {
          success: false,
          message: "Connection string is required",
        },
        { status: 400 },
      );
    }

    // Validate connection string format
    const validation = validateConnectionString(connectionString);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 },
      );
    }

    // Create client with the validated connection string
    client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Try to connect
    await client.connect();

    // Get database information
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        version() as postgres_version,
        pg_database_size(current_database()) as database_size
    `);

    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);

    const tablesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE'
    `);

    await client.end();

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      data: {
        databaseName: dbInfo.rows[0].database_name,
        postgresVersion: dbInfo.rows[0].postgres_version,
        databaseSize: parseInt(dbInfo.rows[0].database_size),
        schemas: schemasResult.rows.map((r) => r.schema_name),
        tableCount: parseInt(tablesResult.rows[0].count),
      },
    });
  } catch (error) {
    // Make sure to close the connection
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // Ignore errors when closing
      }
    }

    console.error("Connection test error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to database",
      },
      { status: 500 },
    );
  }
}
