import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateTeacherSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
  userId: z.string().nullable().optional(),
  subjectIds: z.array(z.string()).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const teacher = await db.teacher.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        timetableEntries: {
          include: {
            class: true,
            subject: true,
            room: true,
            timeSlot: true,
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

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateTeacherSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const existingTeacher = await db.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const { subjectIds, ...updateData } = validated.data;

    // If updating employeeId, check for duplicates
    if (updateData.employeeId && updateData.employeeId !== existingTeacher.employeeId) {
      const duplicateByEmployeeId = await db.teacher.findUnique({
        where: { employeeId: updateData.employeeId },
      });

      if (duplicateByEmployeeId) {
        return NextResponse.json(
          { error: "A teacher with this employee ID already exists" },
          { status: 400 }
        );
      }
    }

    // If updating email, check for duplicates
    if (updateData.email && updateData.email !== existingTeacher.email) {
      const duplicateByEmail = await db.teacher.findUnique({
        where: { email: updateData.email },
      });

      if (duplicateByEmail) {
        return NextResponse.json(
          { error: "A teacher with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Update teacher and subject associations in a transaction
    const teacher = await db.$transaction(async (tx: typeof db) => {
      // Update subject associations if provided
      if (subjectIds !== undefined) {
        // Remove all existing associations
        await tx.teacherSubject.deleteMany({
          where: { teacherId: id },
        });

        // Create new associations
        if (subjectIds.length > 0) {
          await tx.teacherSubject.createMany({
            data: subjectIds.map((subjectId) => ({
              teacherId: id,
              subjectId,
            })),
          });
        }
      }

      // Update teacher
      return tx.teacher.update({
        where: { id },
        data: updateData,
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if teacher exists
    const existingTeacher = await db.teacher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Check if teacher has timetable entries
    if (existingTeacher._count.timetableEntries > 0) {
      return NextResponse.json(
        { error: "Cannot delete teacher with existing timetable entries" },
        { status: 400 }
      );
    }

    await db.teacher.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Teacher deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
