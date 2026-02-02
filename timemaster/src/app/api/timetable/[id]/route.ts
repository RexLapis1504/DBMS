import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateTimetableEntrySchema = z.object({
  classId: z.string().min(1, "Class ID is required").optional(),
  subjectId: z.string().min(1, "Subject ID is required").optional(),
  teacherId: z.string().min(1, "Teacher ID is required").optional(),
  roomId: z.string().min(1, "Room ID is required").optional(),
  timeSlotId: z.string().min(1, "Time slot ID is required").optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const timetableEntry = await db.timetableEntry.findUnique({
      where: { id },
      include: {
        class: true,
        subject: true,
        teacher: true,
        room: true,
        timeSlot: true,
      },
    });

    if (!timetableEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(timetableEntry);
  } catch (error) {
    console.error("Error fetching timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateTimetableEntrySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if timetable entry exists
    const existingEntry = await db.timetableEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    const updateData = validated.data;

    // Compute final values (merging existing with updates)
    const finalClassId = updateData.classId ?? existingEntry.classId;
    const finalTeacherId = updateData.teacherId ?? existingEntry.teacherId;
    const finalRoomId = updateData.roomId ?? existingEntry.roomId;
    const finalTimeSlotId = updateData.timeSlotId ?? existingEntry.timeSlotId;

    // Verify all referenced entities exist
    if (updateData.classId) {
      const classData = await db.class.findUnique({ where: { id: updateData.classId } });
      if (!classData) {
        return NextResponse.json({ error: "Class not found" }, { status: 400 });
      }
    }

    if (updateData.subjectId) {
      const subject = await db.subject.findUnique({ where: { id: updateData.subjectId } });
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 400 });
      }
    }

    if (updateData.teacherId) {
      const teacher = await db.teacher.findUnique({ where: { id: updateData.teacherId } });
      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 400 });
      }
      if (!teacher.isAvailable) {
        return NextResponse.json({ error: "Teacher is not available" }, { status: 400 });
      }
    }

    if (updateData.roomId) {
      const room = await db.room.findUnique({ where: { id: updateData.roomId } });
      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 400 });
      }
      if (!room.isAvailable) {
        return NextResponse.json({ error: "Room is not available" }, { status: 400 });
      }
    }

    if (updateData.timeSlotId) {
      const timeSlot = await db.timeSlot.findUnique({ where: { id: updateData.timeSlotId } });
      if (!timeSlot) {
        return NextResponse.json({ error: "Time slot not found" }, { status: 400 });
      }
    }

    // Check for conflicts (excluding current entry)
    // Check if class already has an entry at this time slot
    if (updateData.classId !== undefined || updateData.timeSlotId !== undefined) {
      const classConflict = await db.timetableEntry.findFirst({
        where: {
          classId: finalClassId,
          timeSlotId: finalTimeSlotId,
          NOT: { id },
        },
      });
      if (classConflict) {
        return NextResponse.json(
          { error: "Class already has a scheduled entry at this time slot" },
          { status: 409 }
        );
      }
    }

    // Check if teacher already has an entry at this time slot
    if (updateData.teacherId !== undefined || updateData.timeSlotId !== undefined) {
      const teacherConflict = await db.timetableEntry.findFirst({
        where: {
          teacherId: finalTeacherId,
          timeSlotId: finalTimeSlotId,
          NOT: { id },
        },
      });
      if (teacherConflict) {
        return NextResponse.json(
          { error: "Teacher already has a scheduled entry at this time slot" },
          { status: 409 }
        );
      }
    }

    // Check if room already has an entry at this time slot
    if (updateData.roomId !== undefined || updateData.timeSlotId !== undefined) {
      const roomConflict = await db.timetableEntry.findFirst({
        where: {
          roomId: finalRoomId,
          timeSlotId: finalTimeSlotId,
          NOT: { id },
        },
      });
      if (roomConflict) {
        return NextResponse.json(
          { error: "Room already has a scheduled entry at this time slot" },
          { status: 409 }
        );
      }
    }

    const timetableEntry = await db.timetableEntry.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        subject: true,
        teacher: true,
        room: true,
        timeSlot: true,
      },
    });

    return NextResponse.json(timetableEntry);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to update timetable entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if timetable entry exists
    const existingEntry = await db.timetableEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    await db.timetableEntry.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Timetable entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 }
    );
  }
}
