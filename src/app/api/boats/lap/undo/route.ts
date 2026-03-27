import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.id) return NextResponse.json({ error: 'Invalid boat ID' }, { status: 500 });
    if (!await prisma.boat.findFirst({ where: { id: body.id } })) return NextResponse.json({ error: 'Cannot find boat' }, { status: 500 });

    // Find the current in-progress lap (end is null)
    const currentLap = await prisma.lap.findFirst({
      where: {
        boatId: body.id,
        end: null,
      },
    });

    if (!currentLap) return NextResponse.json({ error: 'No active lap found' }, { status: 500 });

    // Find the most recently completed lap (has an end time)
    const previousLap = await prisma.lap.findFirst({
      where: {
        boatId: body.id,
        end: { not: null },
      },
      orderBy: {
        end: 'desc',
      },
    });

    // Delete the current in-progress lap
    await prisma.lap.delete({
      where: {
        id: currentLap.id,
      },
    });

    // Reopen the previous completed lap by clearing its end time
    if (previousLap) {
      await prisma.lap.update({
        where: {
          id: previousLap.id,
        },
        data: {
          end: null,
        },
      });
    }

    return NextResponse.json({ undone: true }, { status: 200 });
  } catch (error) {
    console.error({ boatsAddFailed: error });
    return NextResponse.json({ error: 'Failed to undo lap' }, { status: 500 });
  }
}