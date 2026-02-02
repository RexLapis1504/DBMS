import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createTeacherSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  isAvailable: z.boolean().default(true),
  userId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const isAvailable = searchParams.get("isAvailable");

    const where: Record<string, unknown> = {};

    if (department) {
      where.department = department;
    }
    if (isAvailable !== null) {
      where.isAvailable = isAvailable === "true";
    }

    const teachers = await db.teacher.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createTeacherSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { employeeId, name, email, phone, department, designation, isAvailable, userId } = validated.data;

    // Check if teacher with same employee ID already exists
    const existingByEmployeeId = await db.teacher.findUnique({
      where: { employeeId },
    });

    if (existingByEmployeeId) {
      return NextResponse.json(
        { error: "A teacher with this employee ID already exists" },
        { status: 400 }
      );
    }

    // Check if teacher with same email already exists
    const existingByEmail = await db.teacher.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "A teacher with this email already exists" },
        { status: 400 }
      );
    }

    const teacher = await db.teacher.create({
      data: {
        employeeId,
        name,
        email,
        phone,
        department,
        designation,
        isAvailable,
        userId,
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
