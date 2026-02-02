import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer").optional(),
  roomType: z.enum(["CLASSROOM", "LAB", "AUDITORIUM", "SEMINAR_HALL"]).optional(),
  building: z.string().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  isAvailable: z.boolean().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const room = await db.room.findUnique({
      where: { id },
      include: {
        timetableEntries: {
          include: {
            class: true,
            subject: true,
            teacher: true,
            timeSlot: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateRoomSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (validated.data.name && validated.data.name !== existingRoom.name) {
      const duplicateRoom = await db.room.findUnique({
        where: { name: validated.data.name },
      });

      if (duplicateRoom) {
        return NextResponse.json(
          { error: "A room with this name already exists" },
          { status: 400 }
        );
      }
    }

    const room = await db.room.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room has timetable entries
    if (existingRoom._count.timetableEntries > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with existing timetable entries" },
        { status: 400 }
      );
    }

    await db.room.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
