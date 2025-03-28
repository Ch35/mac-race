import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.id) return NextResponse.json({ error: 'Invalid boat ID' }, { status: 500 });
    if (!await prisma.boat.findFirst({ where: { id: body.id } })) return NextResponse.json({ error: 'Cannot find boat' }, { status: 500 });

    const recentLap = await prisma.lap.findFirst({
      where: {
        boatId: body.id,
      },
      orderBy: {
        end: 'desc',
      },
    });

    if (!recentLap) return NextResponse.json({ error: 'No recent lap found' }, { status: 500 });

    await prisma.lap.update({
      where: {
        id: recentLap.id,
      },
      data: {
        start: new Date(),
        end: null,
      },
    });

    // const previousLap = await prisma.lap.findFirst({
    //   where: {
    //     boatId: body.id,
    //     end: recentLap.start,
    //   },
    //   orderBy: {
    //     end: 'desc',
    //   },
    // });

    // if (previousLap) {
    //   await prisma.lap.update({
    //     where: {
    //       id: previousLap.id,
    //     },
    //     data: {
    //       end: null,
    //     },
    //   });
    // }

    // await prisma.lap.delete({
    //   where: {
    //     id: recentLap.id,
    //   },
    // });

    return NextResponse.json({ undone: true }, { status: 200 });
  } catch (error) {
    console.error({ boatsAddFailed: error });
    return NextResponse.json({ error: 'Failed to undo lap' }, { status: 500 });
  }
}