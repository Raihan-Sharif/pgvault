import { validateBackupName, validateConnectionString } from "@/lib/utils";
import { createBackup } from "@/scripts/backup";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionString, backupName, compress, schemasOnly } = body;

    if (!connectionString || !backupName) {
      return NextResponse.json(
        {
          success: false,
          message: "Connection string and backup name are required",
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

    // Validate backup name
    const nameValidation = validateBackupName(backupName);
    if (!nameValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: nameValidation.error,
        },
        { status: 400 },
      );
    }

    const options = {
      compress: compress === true,
      schemasOnly: schemasOnly || null,
    };

    const result = await createBackup(connectionString, backupName, options);

    return NextResponse.json({
      success: true,
      message: "Backup created successfully!",
      data: {
        filepath: result.filepath,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create backup",
      },
      { status: 500 },
    );
  }
}
