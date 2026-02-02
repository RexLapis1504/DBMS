import { db } from "@/lib/db";
import { RoomsClient } from "./client";

async function getRooms() {
  const rooms = await db.room.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { timetableEntries: true },
      },
    },
  });
  return rooms;
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return <RoomsClient data={rooms} />;
}
