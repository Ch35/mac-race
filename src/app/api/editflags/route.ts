import prisma from "@/lib/prisma";
import { isInteger } from "lodash";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const flags = await request.json();

    if (!flags?.min.trim() || !isInteger(+flags.min)) return NextResponse.json({ error: 'Invalid minimum lap time' }, { status: 500 });
    if (!flags?.max.trim() || !isInteger(+flags.max)) return NextResponse.json({ error: 'Invalid max lap time' }, { status: 500 });

    await prisma.race.updateMany({
      data: {
        minLapTime: +flags.min,
        maxLapTime: +flags.max,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error({ flagEditError: error });
    return NextResponse.json({ error: 'Failed to update flags' }, { status: 500 });
  }
}