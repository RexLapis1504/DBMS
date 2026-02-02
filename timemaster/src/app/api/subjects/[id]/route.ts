import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateSubjectSchema = z.object({
  code: z.string().min(1, "Subject code is required").optional(),
  name: z.string().min(2, "Subject name must be at least 2 characters").optional(),
  credits: z.number().int().min(1).max(10).optional(),
  subjectType: z.enum(["THEORY", "PRACTICAL", "TUTORIAL"]).optional(),
  teacherIds: z.array(z.string()).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const subject = await db.subject.findUnique({
      where: { id },
      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },
        timetableEntries: {
          include: {
            class: true,
            teacher: true,
            room: true,
            timeSlot: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSubjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await db.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    const { teacherIds, ...updateData } = validated.data;

    // If updating code, check for duplicates
    if (updateData.code && updateData.code !== existingSubject.code) {
      const duplicateSubject = await db.subject.findUnique({
        where: { code: updateData.code },
      });

      if (duplicateSubject) {
        return NextResponse.json(
          { error: "A subject with this code already exists" },
          { status: 400 }
        );
      }
    }

    // Update subject and teacher associations in a transaction
    const subject = await db.$transaction(async (tx: typeof db) => {
      // Update teacher associations if provided
      if (teacherIds !== undefined) {
        // Remove all existing associations
        await tx.teacherSubject.deleteMany({
          where: { subjectId: id },
        });

        // Create new associations
        if (teacherIds.length > 0) {
          await tx.teacherSubject.createMany({
            data: teacherIds.map((teacherId) => ({
              teacherId,
              subjectId: id,
            })),
          });
        }
      }

      // Update subject
      return tx.subject.update({
        where: { id },
        data: updateData,
        include: {
          teachers: {
            include: {
              teacher: true,
            },
          },
        },
      });
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if subject exists
    const existingSubject = await db.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if subject has timetable entries
    if (existingSubject._count.timetableEntries > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with existing timetable entries" },
        { status: 400 }
      );
    }

    await db.subject.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Subject deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
