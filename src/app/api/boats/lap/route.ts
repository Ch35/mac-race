import prisma from "@/lib/prisma";
import { dataEvents } from "@/lib/events";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if(!body?.id) return NextResponse.json({ error: 'Invalid boat ID' }, { status: 500 });

    const boat = await prisma.boat.findFirst({ where: { id: body.id }, include: { races: true } });
    if(!boat) return NextResponse.json({ error: 'Cannot find boat' }, { status: 500 });

    const recentUnfinishedLap = await prisma.lap.findFirst({
      where: {
        boatId: body.id,
        end: undefined,
      },
      orderBy: {
        end: 'desc',
      },
    });
    const lapEnd = new Date();

    const firstRace = boat.races[0];
    if (!firstRace) {
      const errorMsg = 'Boat is not part of any races';
      console.error({ boatsAddFailed: errorMsg });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // If no laps exist, create a completed lap from race start to now
    if (!recentUnfinishedLap) {
      const lapCount = await prisma.lap.count({ where: { boatId: body.id } });
      
      if (lapCount === 0) {
        // First lap: use race start time as lap start, current time as lap end
        await prisma.lap.create({
          data: {
            start: firstRace.start,
            end: lapEnd,
            boatId: body.id,
          }
        });

        // Create a new open lap starting now
        await prisma.lap.create({
          data: {
            start: lapEnd,
            boatId: body.id,
          }
        });

        dataEvents.emit();
        return NextResponse.json({ lap: null }, { status: 200 });
      }
    }

    const newLap = {
      start: lapEnd,
      boatId: body.id,
    }

    if (recentUnfinishedLap) {
      // Enforce minimum lap time unless force is set
      if (!body.force) {
        const minLapTime = firstRace.minLapTime;
        const lapTimeSec = (lapEnd.getTime() - recentUnfinishedLap.start.getTime()) / 1000;

        if(minLapTime * 60 > lapTimeSec) {
          return NextResponse.json({ error: `Lap is less than ${minLapTime} minute(s)` }, { status: 500 });
        }
      }

      await prisma.lap.update({ 
        where: { id: recentUnfinishedLap.id },
        data: { ...recentUnfinishedLap, end: lapEnd },
      }); 
    }

    await prisma.lap.create({ data: newLap });

    dataEvents.emit();

    return NextResponse.json({ lap: recentUnfinishedLap }, { status: 200 });
  } catch (error) {
    console.error({ boatsAddFailed: error });
    return NextResponse.json({ error: 'Failed to create lap' }, { status: 500 });
  }
}