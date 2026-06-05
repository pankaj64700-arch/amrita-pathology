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

    const sampleRequests = await prisma.sampleRequest.count();

    const reports = await prisma.report.count({
      where:
        userRole === "PATHOLOGIST" || userRole === "ADMIN"
          ? {}
          : { patientId: userId },
    });

    return NextResponse.json({
      sampleRequests,
      reports,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        sampleRequests: 0,
        reports: 0,
      },
      { status: 500 }
    );
  }
}