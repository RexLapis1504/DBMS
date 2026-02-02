import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { generateOptimizationSuggestions, TimetableConstraints } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const optimizeSchema = z.object({
  classId: z.string().optional(),
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
        { error: "Only administrators can use optimization features" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = optimizeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { classId, constraints } = validated.data;

    // Fetch current timetable
    const whereClause = classId ? { classId } : {};
    const timetableEntries = await db.timetableEntry.findMany({
      where: whereClause,
      include: {
        subject: true,
        teacher: true,
        room: true,
        class: true,
        timeSlot: true,
      },
    });

    if (timetableEntries.length === 0) {
      return NextResponse.json({
        suggestions: [
          {
            type: "warning",
            message: "No timetable entries found. Create some entries first to get optimization suggestions.",
          },
        ],
      });
    }

    const timetableSlots = timetableEntries.map((entry) => ({
      day: entry.timeSlot.day,
      period: entry.timeSlot.period,
      startTime: entry.timeSlot.startTime,
      endTime: entry.timeSlot.endTime,
      subjectName: entry.subject.name,
      subjectCode: entry.subject.code,
      teacherName: entry.teacher.name,
      roomName: entry.room.name,
      className: entry.class.name,
    }));

    const defaultConstraints: TimetableConstraints = {
      maxClassesPerDay: constraints?.maxClassesPerDay || 6,
      minBreakBetweenClasses: constraints?.minBreakBetweenClasses || 10,
      preferredStartTime: constraints?.preferredStartTime || "09:00",
      preferredEndTime: constraints?.preferredEndTime || "17:00",
      avoidBackToBackLabs: constraints?.avoidBackToBackLabs ?? true,
    };

    const suggestions = await generateOptimizationSuggestions(
      timetableSlots,
      defaultConstraints
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI Optimization error:", error);
    return NextResponse.json(
      { error: "Failed to generate optimization suggestions" },
      { status: 500 }
    );
  }
}
