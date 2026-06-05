import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const body = await req.json();

    const {
      patientName,
      phone,
      address,
      testName,
      preferredDate,
    } = body;

    if (!patientName || !phone || !address || !testName || !preferredDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(`${preferredDate}T00:00:00`);

    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid preferred date" },
        { status: 400 }
      );
    }

    const request = await prisma.sampleRequest.create({
      data: {
        patientName,
        phone,
        address,
        testName,
        preferredDate: parsedDate,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Create sample request error:", error);

    return NextResponse.json(
      { error: "Failed to create sample request" },
      { status: 500 }
    );
  }
}