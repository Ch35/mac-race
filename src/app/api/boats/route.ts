import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
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

    const sortedBoats = [...boats].sort((a, b) => {
      const aLastLap = a.laps.length > 0 ? a.laps[a.laps.length - 1].start : null;
      const bLastLap = b.laps.length > 0 ? b.laps[b.laps.length - 1].start : null;
      
      // Boats with no laps go to the end
      if (!aLastLap && !bLastLap) return 0;
      if (!aLastLap) return 1;
      if (!bLastLap) return -1;
      
      return new Date(aLastLap).getTime() - new Date(bLastLap).getTime();
    });

    return NextResponse.json(sortedBoats, { status: 200 });
  } catch(error) {
    console.error({ boatsFetchFailed: error });
    return NextResponse.json({ error: "Failed to fetch boats" }, { status: 500 });
  }
}