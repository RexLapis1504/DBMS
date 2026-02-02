import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").optional(),
  program: z.string().min(1, "Program is required").optional(),
  year: z.number().int().min(1).max(6).optional(),
  division: z.string().nullable().optional(),
  semester: z.number().int().min(1).max(12).optional(),
  strength: z.number().int().positive().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            rollNumber: true,
            name: true,
            email: true,
          },
          orderBy: { rollNumber: "asc" },
        },
        timetableEntries: {
          include: {
            subject: true,
            teacher: true,
            room: true,
            timeSlot: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateClassSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await db.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (validated.data.name && validated.data.name !== existingClass.name) {
      const duplicateClass = await db.class.findUnique({
        where: { name: validated.data.name },
      });

      if (duplicateClass) {
        return NextResponse.json(
          { error: "A class with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedClass = await db.class.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if class exists
    const existingClass = await db.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            timetableEntries: true,
          },
        },
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Check if class has students or timetable entries
    if (existingClass._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with enrolled students" },
        { status: 400 }
      );
    }

    if (existingClass._count.timetableEntries > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with existing timetable entries" },
        { status: 400 }
      );
    }

    await db.class.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
