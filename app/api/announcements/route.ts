import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Public announcements error:", error);

    return NextResponse.json([]);
  }
}