import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createTimetableEntrySchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  timeSlotId: z.string().min(1, "Time slot ID is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const roomId = searchParams.get("roomId");
    const day = searchParams.get("day");

    const where: Record<string, unknown> = {};

    if (classId) {
      where.classId = classId;
    }
    if (teacherId) {
      where.teacherId = teacherId;
    }
    if (roomId) {
      where.roomId = roomId;
    }
    if (day) {
      where.timeSlot = { day };
    }

    const timetableEntries = await db.timetableEntry.findMany({
      where,
      orderBy: [
        { timeSlot: { day: "asc" } },
        { timeSlot: { period: "asc" } },
      ],
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
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            subjectType: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            roomType: true,
            building: true,
          },
        },
        timeSlot: {
          select: {
            id: true,
            day: true,
            period: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return NextResponse.json(timetableEntries);
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createTimetableEntrySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { classId, subjectId, teacherId, roomId, timeSlotId } = validated.data;

    // Verify all referenced entities exist
    const [classExists, subjectExists, teacherExists, roomExists, timeSlotExists] = await Promise.all([
      db.class.findUnique({ where: { id: classId } }),
      db.subject.findUnique({ where: { id: subjectId } }),
      db.teacher.findUnique({ where: { id: teacherId } }),
      db.room.findUnique({ where: { id: roomId } }),
      db.timeSlot.findUnique({ where: { id: timeSlotId } }),
    ]);

    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 400 }
      );
    }

    if (!subjectExists) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 400 }
      );
    }

    if (!teacherExists) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 400 }
      );
    }

    if (!roomExists) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 400 }
      );
    }

    if (!timeSlotExists) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const [classConflict, teacherConflict, roomConflict] = await Promise.all([
      // Check if class already has an entry at this time slot
      db.timetableEntry.findUnique({
        where: {
          classId_timeSlotId: { classId, timeSlotId },
        },
      }),
      // Check if teacher already has an entry at this time slot
      db.timetableEntry.findUnique({
        where: {
          teacherId_timeSlotId: { teacherId, timeSlotId },
        },
      }),
      // Check if room already has an entry at this time slot
      db.timetableEntry.findUnique({
        where: {
          roomId_timeSlotId: { roomId, timeSlotId },
        },
      }),
    ]);

    if (classConflict) {
      return NextResponse.json(
        { error: "Class already has a scheduled entry at this time slot" },
        { status: 409 }
      );
    }

    if (teacherConflict) {
      return NextResponse.json(
        { error: "Teacher already has a scheduled entry at this time slot" },
        { status: 409 }
      );
    }

    if (roomConflict) {
      return NextResponse.json(
        { error: "Room already has a scheduled entry at this time slot" },
        { status: 409 }
      );
    }

    // Check if room is available
    if (!roomExists.isAvailable) {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      );
    }

    // Check if teacher is available
    if (!teacherExists.isAvailable) {
      return NextResponse.json(
        { error: "Teacher is not available" },
        { status: 400 }
      );
    }

    const timetableEntry = await db.timetableEntry.create({
      data: {
        classId,
        subjectId,
        teacherId,
        roomId,
        timeSlotId,
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
        room: true,
        timeSlot: true,
      },
    });

    return NextResponse.json(timetableEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    );
  }
}
