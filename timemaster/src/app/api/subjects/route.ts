import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSubjectSchema = z.object({
  code: z.string().min(1, "Subject code is required"),
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  credits: z.number().int().min(1).max(10).default(3),
  subjectType: z.enum(["THEORY", "PRACTICAL", "TUTORIAL"]).default("THEORY"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectType = searchParams.get("subjectType");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (subjectType) {
      where.subjectType = subjectType;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const subjects = await db.subject.findMany({
      where,
      orderBy: { code: "asc" },
      include: {
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                employeeId: true,
              },
            },
          },
        },
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createSubjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, name, credits, subjectType } = validated.data;

    // Check if subject with same code already exists
    const existingSubject = await db.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "A subject with this code already exists" },
        { status: 400 }
      );
    }

    const subject = await db.subject.create({
      data: {
        code,
        name,
        credits,
        subjectType,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
