import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "COLLECTED",
  "PROCESSING",
  "COMPLETED",
];

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.sampleRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update status error:", error);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}