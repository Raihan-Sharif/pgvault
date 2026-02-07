import { validateConnectionString } from "@/lib/utils";
import { restoreBackup } from "@/scripts/restore";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionString, backupFilename, clean, dataOnly, schemaOnly } =
      body;

    if (!connectionString || !backupFilename) {
      return NextResponse.json(
        {
          success: false,
          message: "Connection string and backup filename are required",
        },
        { status: 400 },
      );
    }

    // Validate connection string
    const connValidation = validateConnectionString(connectionString);
    if (!connValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: connValidation.error,
        },
        { status: 400 },
      );
    }

    // Construct backup file path
    const backupPath = path.join(process.cwd(), "backups", backupFilename);

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup file not found",
        },
        { status: 404 },
      );
    }

    const options = {
      clean: clean === true,
      dataOnly: dataOnly === true,
      schemaOnly: schemaOnly === true,
    };

    const result = await restoreBackup(connectionString, backupPath, options);

    return NextResponse.json({
      success: true,
      message: "Database restored successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Restore error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to restore backup",
      },
      { status: 500 },
    );
  }
}
