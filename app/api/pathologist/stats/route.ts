import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function checkPathologistOrAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return role === "PATHOLOGIST" || role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await checkPathologistOrAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalPatients,
      totalRequests,
      pendingRequests,
      confirmedRequests,
      collectedRequests,
      processingRequests,
      completedRequests,
      reportsUploaded,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "PATIENT" },
      }),

      prisma.sampleRequest.count(),

      prisma.sampleRequest.count({
        where: { status: "PENDING" },
      }),

      prisma.sampleRequest.count({
        where: { status: "CONFIRMED" },
      }),

      prisma.sampleRequest.count({
        where: { status: "COLLECTED" },
      }),

      prisma.sampleRequest.count({
        where: { status: "PROCESSING" },
      }),

      prisma.sampleRequest.count({
        where: { status: "COMPLETED" },
      }),

      prisma.report.count(),
    ]);

    return NextResponse.json({
      totalPatients,
      totalRequests,
      pendingRequests,
      confirmedRequests,
      collectedRequests,
      processingRequests,
      completedRequests,
      reportsUploaded,
    });
  } catch (error) {
    console.error("Pathologist stats error:", error);

    return NextResponse.json(
      { error: "Failed to fetch pathologist stats" },
      { status: 500 }
    );
  }
}