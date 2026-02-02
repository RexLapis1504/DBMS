import { db } from "@/lib/db";
import { TimeSlotsClient } from "./client";

async function getTimeSlots() {
  const timeSlots = await db.timeSlot.findMany({
    orderBy: [{ day: "asc" }, { period: "asc" }],
    include: {
      _count: {
        select: { timetableEntries: true },
      },
    },
  });
  return timeSlots;
}

export default async function TimeSlotsPage() {
  const timeSlots = await getTimeSlots();

  return <TimeSlotsClient data={timeSlots} />;
}
