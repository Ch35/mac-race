import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const races = await prisma.race.findMany({
      include: { boats: true }
    });
    return NextResponse.json(races, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch races" }, { status: 500 });
  }
}