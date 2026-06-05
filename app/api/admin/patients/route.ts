import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "PATHOLOGIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      _count: {
        select: {
          reports: true,
          sampleRequests: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPatients = await prisma.user.count({
    where: { role: "PATIENT" },
  });

  const totalRequests = await prisma.sampleRequest.count();

  const totalReports = await prisma.report.count();

  return NextResponse.json({
    totalPatients,
    totalRequests,
    totalReports,
    patients,
  });
}