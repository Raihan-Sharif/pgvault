import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".sql") && !file.name.endsWith(".sql.gz")) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only .sql or .sql.gz allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(os.tmpdir(), "pgvault-backups");

    // Ensure directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = file.name;
    const filepath = path.join(tempDir, filename);

    fs.writeFileSync(filepath, buffer);

    // Create a minimal metadata file for the UI to read
    const metadataPath = filepath.replace(/\.sql(\.gz)?$/, '.json');
    const metadata = {
      backupName: filename,
      timestamp: new Date().toISOString(),
      databaseName: "Imported",
      postgresVersion: "Unknown",
      fileSize: file.size,
      compressed: filename.endsWith(".gz"),
      objectCounts: {}, // Unknown
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filename: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
