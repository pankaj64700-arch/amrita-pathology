import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);

  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile =
      await prisma.pathologistProfile.findFirst();

    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const existing =
      await prisma.pathologistProfile.findFirst();

    if (existing) {
      const updated =
        await prisma.pathologistProfile.update({
          where: {
            id: existing.id,
          },
          data: body,
        });

      return NextResponse.json(updated);
    }

    const created =
      await prisma.pathologistProfile.create({
        data: body,
      });

    return NextResponse.json(created);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}