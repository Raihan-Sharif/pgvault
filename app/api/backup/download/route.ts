import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionString, backupName, schemaOnly, dataOnly } = body;

    if (!connectionString) {
      return NextResponse.json(
        { success: false, message: 'Connection string is required' },
        { status: 400 }
      );
    }

    const filename = backupName || `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;

    // Construct pg_dump command arguments
    const args = ['--clean', '--if-exists'];
    
    if (schemaOnly) args.push('--schema-only');
    if (dataOnly) args.push('--data-only');
    
    args.push(connectionString);

    // Spawn pg_dump process
    // Note: We need to handle potential errors and pipe stdout
    // Since Next.js App Router doesn't easily support piping a child process stdout to a Response body directly with all headers in a simple way without 'duplex',
    // We'll use a ReadableStream.

    const stream = new ReadableStream({
      start(controller) {
        const pgDump = spawn('pg_dump', args, {
          env: { ...process.env, PGPASSWORD: new URL(connectionString).password }
        });

        pgDump.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        pgDump.stderr.on('data', (data) => {
          console.error(`pg_dump stderr: ${data}`);
        });

        pgDump.on('close', (code) => {
          if (code !== 0) {
            controller.error(new Error(`pg_dump exited with code ${code}`));
          } else {
            controller.close();
          }
        });

        pgDump.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Direct download error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate backup' },
      { status: 500 }
    );
  }
}
