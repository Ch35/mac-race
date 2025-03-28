import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const boats = await prisma.boat.findMany({
      include: { class: true, races: true, laps: true }
    });

    const sortedBoats = [...boats].sort((a, b) => {
      return a.laps.length - b.laps.length;
    });

    return NextResponse.json(sortedBoats, { status: 200 });
  } catch(error) {
    console.error({ boatsFetchFailed: error });
    return NextResponse.json({ error: "Failed to fetch boats" }, { status: 500 });
  }
}