import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  roomType: z.enum(["CLASSROOM", "LAB", "AUDITORIUM", "SEMINAR_HALL"]).default("CLASSROOM"),
  building: z.string().optional(),
  floor: z.number().int().optional(),
  isAvailable: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get("roomType");
    const isAvailable = searchParams.get("isAvailable");
    const building = searchParams.get("building");

    const where: Record<string, unknown> = {};

    if (roomType) {
      where.roomType = roomType;
    }
    if (isAvailable !== null) {
      where.isAvailable = isAvailable === "true";
    }
    if (building) {
      where.building = building;
    }

    const rooms = await db.room.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { timetableEntries: true },
        },
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createRoomSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, capacity, roomType, building, floor, isAvailable } = validated.data;

    // Check if room with same name already exists
    const existingRoom = await db.room.findUnique({
      where: { name },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: "A room with this name already exists" },
        { status: 400 }
      );
    }

    const room = await db.room.create({
      data: {
        name,
        capacity,
        roomType,
        building,
        floor,
        isAvailable,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
