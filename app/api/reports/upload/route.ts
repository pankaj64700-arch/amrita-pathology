import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const reportName = formData.get("reportName") as string;
    const patientId = formData.get("patientId") as string;
    const requestId = formData.get("requestId") as string;
    const file = formData.get("file") as File;

    if (!reportName || !patientId || !file) {
      return NextResponse.json(
        { error: "Report name, patient ID and PDF file are required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "reports"
    );

    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/reports/${safeFileName}`;

    const report = await prisma.report.create({
      data: {
        reportName,
        patientId,
        fileUrl,
      },
    });

    if (requestId) {
      await prisma.sampleRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "COMPLETED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Upload report error:", error);

    return NextResponse.json(
      { error: "Failed to upload report" },
      { status: 500 }
    );
  }
}