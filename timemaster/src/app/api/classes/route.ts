import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  program: z.string().min(1, "Program is required"),
  year: z.number().int().min(1).max(6),
  division: z.string().optional(),
  semester: z.number().int().min(1).max(12),
  strength: z.number().int().positive().default(60),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const program = searchParams.get("program");
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");

    const where: Record<string, unknown> = {};

    if (program) {
      where.program = program;
    }
    if (year) {
      where.year = parseInt(year, 10);
    }
    if (semester) {
      where.semester = parseInt(semester, 10);
    }

    const classes = await db.class.findMany({
      where,
      orderBy: [{ program: "asc" }, { year: "asc" }, { division: "asc" }],
      include: {
        _count: {
          select: {
            students: true,
            timetableEntries: true,
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createClassSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, program, year, division, semester, strength } = validated.data;

    // Check if class with same name already exists
    const existingClass = await db.class.findUnique({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "A class with this name already exists" },
        { status: 400 }
      );
    }

    const newClass = await db.class.create({
      data: {
        name,
        program,
        year,
        division,
        semester,
        strength,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
