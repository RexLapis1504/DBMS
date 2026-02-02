import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createTimeSlotSchema = z.object({
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  period: z.number().int().min(1).max(12),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    const where: Record<string, unknown> = {};

    if (day) {
      where.day = day;
    }

    const timeSlots = await db.timeSlot.findMany({
      where,
      orderBy: [{ day: "asc" }, { period: "asc" }],
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createTimeSlotSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { day, period, startTime, endTime } = validated.data;

    // Validate that startTime is before endTime
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Check if time slot with same day and period already exists
    const existingByDayPeriod = await db.timeSlot.findUnique({
      where: {
        day_period: { day, period },
      },
    });

    if (existingByDayPeriod) {
      return NextResponse.json(
        { error: "A time slot with this day and period already exists" },
        { status: 400 }
      );
    }

    // Check if time slot with same day, start time, and end time already exists
    const existingByDayTime = await db.timeSlot.findUnique({
      where: {
        day_startTime_endTime: { day, startTime, endTime },
      },
    });

    if (existingByDayTime) {
      return NextResponse.json(
        { error: "A time slot with this day and time range already exists" },
        { status: 400 }
      );
    }

    const timeSlot = await db.timeSlot.create({
      data: {
        day,
        period,
        startTime,
        endTime,
      },
    });

    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error("Error creating time slot:", error);
    return NextResponse.json(
      { error: "Failed to create time slot" },
      { status: 500 }
    );
  }
}
