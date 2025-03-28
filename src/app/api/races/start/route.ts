import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.raceId) return NextResponse.json({ error: 'Invalid race ID' }, { status: 500 });

    const race = await prisma.race.findFirst({
      where: {
        id: body.raceId,
      },
      include: { boats: true },
    });

    if (!race) return NextResponse.json({ error: 'Unable to find race' }, { status: 500 });

    if (race.lapStarted) return NextResponse.json({ started: true }, { status: 200 });

    await prisma.race.update({
      where: {
        id: race.id,
      },
      data: {
        lapStarted: true,
      }
    });

    const laps = race.boats.map((boat) => ({
      start: new Date(),
      boatId: boat.id,
    }));

    await prisma.lap.createMany({ data: laps });

    return NextResponse.json({ started: true }, { status: 200 });
  } catch (error) {
    console.error({ startRaceError: error });
    return NextResponse.json({ error: 'Failed to start race' }, { status: 500 });
  }
}