import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateStudentSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  classId: z.string().min(1, "Class ID is required").optional(),
  userId: z.string().nullable().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            timetableEntries: {
              include: {
                subject: true,
                teacher: true,
                room: true,
                timeSlot: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateStudentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const updateData = validated.data;

    // If updating classId, verify class exists
    if (updateData.classId) {
      const classExists = await db.class.findUnique({
        where: { id: updateData.classId },
      });

      if (!classExists) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 400 }
        );
      }
    }

    // If updating rollNumber, check for duplicates
    if (updateData.rollNumber && updateData.rollNumber !== existingStudent.rollNumber) {
      const duplicateByRollNumber = await db.student.findUnique({
        where: { rollNumber: updateData.rollNumber },
      });

      if (duplicateByRollNumber) {
        return NextResponse.json(
          { error: "A student with this roll number already exists" },
          { status: 400 }
        );
      }
    }

    // If updating email, check for duplicates
    if (updateData.email && updateData.email !== existingStudent.email) {
      const duplicateByEmail = await db.student.findUnique({
        where: { email: updateData.email },
      });

      if (duplicateByEmail) {
        return NextResponse.json(
          { error: "A student with this email already exists" },
          { status: 400 }
        );
      }
    }

    const student = await db.student.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    await db.student.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
