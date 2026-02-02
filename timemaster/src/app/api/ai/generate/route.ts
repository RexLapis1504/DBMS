import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { generateTimetableSuggestion, TimetableConstraints } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const generateSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  constraints: z.object({
    maxClassesPerDay: z.number().min(1).max(10).default(6),
    minBreakBetweenClasses: z.number().min(0).max(60).default(10),
    preferredStartTime: z.string().default("09:00"),
    preferredEndTime: z.string().default("17:00"),
    avoidBackToBackLabs: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can generate timetables" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = generateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { classId, constraints } = validated.data;

    // Verify class exists
    const targetClass = await db.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Fetch all required data
    const [subjects, teachers, rooms, timeSlots] = await Promise.all([
      db.subject.findMany(),
      db.teacher.findMany({
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      }),
      db.room.findMany({
        where: { isAvailable: true },
      }),
      db.timeSlot.findMany({
        orderBy: [{ day: "asc" }, { period: "asc" }],
      }),
    ]);

    if (subjects.length === 0) {
      return NextResponse.json(
        { error: "No subjects found. Add subjects first." },
        { status: 400 }
      );
    }

    if (teachers.length === 0) {
      return NextResponse.json(
        { error: "No teachers found. Add teachers first." },
        { status: 400 }
      );
    }

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: "No rooms available. Add rooms first." },
        { status: 400 }
      );
    }

    if (timeSlots.length === 0) {
      return NextResponse.json(
        { error: "No time slots defined. Add time slots first." },
        { status: 400 }
      );
    }

    const formattedSubjects = subjects.map((s) => ({
      code: s.code,
      name: s.name,
      credits: s.credits,
      type: s.subjectType,
    }));

    const formattedTeachers = teachers.map((t) => ({
      id: t.id,
      name: t.name,
      subjects: t.subjects.map((ts) => ts.subject.code),
    }));

    const formattedRooms = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.roomType,
      capacity: r.capacity,
    }));

    const formattedClasses = [
      {
        id: targetClass.id,
        name: targetClass.name,
        strength: targetClass.strength,
      },
    ];

    const formattedTimeSlots = timeSlots.map((ts) => ({
      day: ts.day,
      period: ts.period,
      startTime: ts.startTime,
      endTime: ts.endTime,
    }));

    const defaultConstraints: TimetableConstraints = {
      maxClassesPerDay: constraints?.maxClassesPerDay || 6,
      minBreakBetweenClasses: constraints?.minBreakBetweenClasses || 10,
      preferredStartTime: constraints?.preferredStartTime || "09:00",
      preferredEndTime: constraints?.preferredEndTime || "17:00",
      avoidBackToBackLabs: constraints?.avoidBackToBackLabs ?? true,
    };

    const suggestedTimetable = await generateTimetableSuggestion(
      formattedSubjects,
      formattedTeachers,
      formattedRooms,
      formattedClasses,
      formattedTimeSlots,
      defaultConstraints
    );

    return NextResponse.json({
      timetable: suggestedTimetable,
      message: `Generated ${suggestedTimetable.length} timetable entries for ${targetClass.name}`,
    });
  } catch (error) {
    console.error("AI Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate timetable suggestions" },
      { status: 500 }
    );
  }
}
