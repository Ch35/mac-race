import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const boat = await request.json();

    if (!boat?.number.trim() || await prisma.boat.findFirst({
      where: { id: boat.number }
    })) return NextResponse.json({ error: 'Invalid boat number' }, { status: 500 });
    if (!boat?.name.trim()) return NextResponse.json({ error: 'Invalid boat name' }, { status: 500 });
    if (!boat?.class.trim()) return NextResponse.json({ error: 'Please select a valid boat class' }, { status: 500 });
    if (!boat?.race.trim()) return NextResponse.json({ error: 'Please select a valid race' }, { status: 500 });

    const races = await prisma.race.findMany({
      where: {
        name: { startsWith: boat.race }
      }
    });

    if (!races) {
      return NextResponse.json({ error: 'Failed to create boat - Unable to find race' }, { status: 500 });
    }

    const created = await prisma.boat.create({
      data: {
        id: boat.number.trim(),
        name: boat.name.trim(),
        classId: +boat.class,
        races: {
          connect: races.map((race) => ({ id: race.id }))
        }
      }
    });

    console.log({ created }); //! d 

    return NextResponse.json({ name: boat.name }, { status: 200 });
  } catch (error) {
    console.error({ boatsAddFailed: error });
    return NextResponse.json({ error: 'Failed to create boat' }, { status: 500 });
  }
}