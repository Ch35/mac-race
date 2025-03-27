import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if(!body?.id) return NextResponse.json({ error: 'Invalid boat ID' }, { status: 500 });
    if(!await prisma.boat.findFirst({ where: { id: body.id } })) return NextResponse.json({ error: 'Cannot find boat' }, { status: 500 });

    // TODO: check for most recent lap
    // TODO: if no most recent lap - create new lap
    // TODO: check if lap has ended - if not update current lap then create new with old end time

    const recentLap = await prisma.lap.findFirst({
      where: {
        boatId: body.id,
        end: undefined,
      },
      orderBy: {
        end: 'desc',
      },
    });

    console.log({ recentLap }); //! d

    return NextResponse.json({ lap: recentLap }, { status: 200 });
  } catch (error) {
    console.error({ boatsAddFailed: error });
    return NextResponse.json({ error: 'Failed to create lap' }, { status: 500 });
  }
}