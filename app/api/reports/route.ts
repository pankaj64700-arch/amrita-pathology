import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const reports = await prisma.report.findMany({
      where:
        userRole === "PATHOLOGIST" || userRole === "ADMIN"
          ? {}
          : { patientId: userId },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Fetch reports error:", error);

    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}