import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const classes = await prisma.class.findMany();
    return NextResponse.json(classes, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}