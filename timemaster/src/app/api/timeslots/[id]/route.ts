import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateTimeSlotSchema = z.object({
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]).optional(),
  period: z.number().int().min(1).max(12).optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const timeSlot = await db.timeSlot.findUnique({
      where: { id },
      include: {
        timetableEntries: {
          include: {
            class: true,
            subject: true,
            teacher: true,
            room: true,
          },
        },
      },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error("Error fetching time slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slot" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateTimeSlotSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if time slot exists
    const existingTimeSlot = await db.timeSlot.findUnique({
      where: { id },
    });

    if (!existingTimeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    const updateData = validated.data;

    // Compute final values (merging existing with updates)
    const finalDay = updateData.day ?? existingTimeSlot.day;
    const finalPeriod = updateData.period ?? existingTimeSlot.period;
    const finalStartTime = updateData.startTime ?? existingTimeSlot.startTime;
    const finalEndTime = updateData.endTime ?? existingTimeSlot.endTime;

    // Validate that startTime is before endTime
    const [startHour, startMin] = finalStartTime.split(":").map(Number);
    const [endHour, endMin] = finalEndTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Check for unique constraint conflicts if day or period is being updated
    if (updateData.day !== undefined || updateData.period !== undefined) {
      const duplicateByDayPeriod = await db.timeSlot.findFirst({
        where: {
          day: finalDay,
          period: finalPeriod,
          NOT: { id },
        },
      });

      if (duplicateByDayPeriod) {
        return NextResponse.json(
          { error: "A time slot with this day and period already exists" },
          { status: 400 }
        );
      }
    }

    // Check for unique constraint conflicts if day, startTime, or endTime is being updated
    if (updateData.day !== undefined || updateData.startTime !== undefined || updateData.endTime !== undefined) {
      const duplicateByDayTime = await db.timeSlot.findFirst({
        where: {
          day: finalDay,
          startTime: finalStartTime,
          endTime: finalEndTime,
          NOT: { id },
        },
      });

      if (duplicateByDayTime) {
        return NextResponse.json(
          { error: "A time slot with this day and time range already exists" },
          { status: 400 }
        );
      }
    }

    const timeSlot = await db.timeSlot.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error("Error updating time slot:", error);
    return NextResponse.json(
      { error: "Failed to update time slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if time slot exists
    const existingTimeSlot = await db.timeSlot.findUnique({
      where: { id },
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    if (!existingTimeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    // Check if time slot has timetable entries
    if (existingTimeSlot._count.timetableEntries > 0) {
      return NextResponse.json(
        { error: "Cannot delete time slot with existing timetable entries" },
        { status: 400 }
      );
    }

    await db.timeSlot.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Time slot deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting time slot:", error);
    return NextResponse.json(
      { error: "Failed to delete time slot" },
      { status: 500 }
    );
  }
}
