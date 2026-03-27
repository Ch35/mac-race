import prisma from "@/lib/prisma";
import { dataEvents } from "@/lib/events";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getBoatsData() {
  const boats = await prisma.boat.findMany({
    include: {
      class: true,
      races: true,
      laps: {
        orderBy: {
          start: 'asc',
        },
      },
    },
  });

  return [...boats].sort((a, b) => a.laps.length - b.laps.length);
}

async function getRacesData() {
  return prisma.race.findMany({
    include: { boats: true },
  });
}

export async function GET() {
  const encoder = new TextEncoder();
  let isClosed = false;
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const sendData = async () => {
        if (isClosed) return;
        
        try {
          const [boats, races] = await Promise.all([
            getBoatsData(),
            getRacesData(),
          ]);

          if (isClosed) return;
          
          const data = JSON.stringify({ boats, races });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          if (!isClosed) {
            console.error('SSE data fetch error:', error);
          }
        }
      };

      // Send initial data immediately
      await sendData();

      // Subscribe to data change events
      const unsubscribe = dataEvents.subscribe(async () => {
        await sendData();
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Connection closed
          isClosed = true;
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on close
      cleanup = () => {
        isClosed = true;
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      // Called when client disconnects
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
