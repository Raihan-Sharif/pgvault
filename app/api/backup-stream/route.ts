import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { connectionString, backupName, compress } = body;

        // Validate inputs
        if (!connectionString || !backupName) {
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            message: 'Missing required fields: connectionString and backupName'
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
          return;
        }

        // Progress emitter function
        const emitProgress = (event: any) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        // Import backup script
        const { createBackup } = require('@/scripts/backup');

        // Call with progress callback
        const result = await createBackup(
          connectionString,
          backupName,
          { compress: compress || false },
          emitProgress
        );

        // Send completion event (already sent by backup script)
        // The backup script sends a 'complete' event with the result
      } catch (error: any) {
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          stage: 'error',
          icon: '❌',
          message: error.message || 'Backup failed',
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
