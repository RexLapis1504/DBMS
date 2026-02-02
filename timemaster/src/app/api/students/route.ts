import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createStudentSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  classId: z.string().min(1, "Class ID is required"),
  userId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (classId) {
      where.classId = classId;
    }

    if (search) {
      where.OR = [
        { rollNumber: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await db.student.findMany({
      where,
      orderBy: [{ classId: "asc" }, { rollNumber: "asc" }],
      include: {
        class: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
            division: true,
          },
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createStudentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rollNumber, name, email, phone, classId, userId } = validated.data;

    // Check if class exists
    const existingClass = await db.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 400 }
      );
    }

    // Check if student with same roll number already exists
    const existingByRollNumber = await db.student.findUnique({
      where: { rollNumber },
    });

    if (existingByRollNumber) {
      return NextResponse.json(
        { error: "A student with this roll number already exists" },
        { status: 400 }
      );
    }

    // Check if student with same email already exists
    const existingByEmail = await db.student.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "A student with this email already exists" },
        { status: 400 }
      );
    }

    const student = await db.student.create({
      data: {
        rollNumber,
        name,
        email,
        phone,
        classId,
        userId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            program: true,
            year: true,
            division: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
