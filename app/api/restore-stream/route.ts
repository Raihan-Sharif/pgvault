import { NextRequest } from 'next/server';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { connectionString, backupFile } = body;

        // Validate inputs
        if (!connectionString || !backupFile) {
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            message: 'Missing required fields: connectionString and backupFile'
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
          return;
        }

        // Construct full path to backup file
        const backupDir = path.join(process.cwd(), 'backups');
        const backupFilePath = path.join(backupDir, backupFile);

        // Progress emitter function
        const emitProgress = (event: any) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        // Import restore script
        const { restoreBackup } = require('@/scripts/restore');

        // Call with progress callback
        const result = await restoreBackup(
          connectionString,
          backupFilePath,
          {},
          emitProgress
        );

        // Send completion event (already sent by restore script)
        // The restore script sends a 'complete' event with the result
      } catch (error: any) {
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          stage: 'error',
          icon: '❌',
          message: error.message || 'Restore failed',
          logType: 'error',
          progress: 0
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
