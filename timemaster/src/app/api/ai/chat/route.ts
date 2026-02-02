import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { chatWithAI } from "@/lib/ai/gemini";
import { db } from "@/lib/db";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  includeContext: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = chatSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { message, includeContext } = validated.data;

    let context = undefined;

    if (includeContext) {
      // Fetch context data from database
      const [timetable, subjects, teachers, rooms] = await Promise.all([
        db.timetableEntry.findMany({
          take: 50,
          include: {
            subject: true,
            teacher: true,
            room: true,
            class: true,
            timeSlot: true,
          },
        }),
        db.subject.findMany({ select: { name: true } }),
        db.teacher.findMany({ select: { name: true } }),
        db.room.findMany({ select: { name: true } }),
      ]);

      context = {
        timetable: timetable.map((entry) => ({
          day: entry.timeSlot.day,
          period: entry.timeSlot.period,
          startTime: entry.timeSlot.startTime,
          endTime: entry.timeSlot.endTime,
          subjectName: entry.subject.name,
          subjectCode: entry.subject.code,
          teacherName: entry.teacher.name,
          roomName: entry.room.name,
          className: entry.class.name,
        })),
        subjects: subjects.map((s) => s.name),
        teachers: teachers.map((t) => t.name),
        rooms: rooms.map((r) => r.name),
      };
    }

    const response = await chatWithAI(message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
