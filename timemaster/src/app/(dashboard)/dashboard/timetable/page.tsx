import { db } from "@/lib/db";
import { TimetableClient } from "./client";

async function getData() {
  const [classes, teachers, subjects, rooms, timeSlots, entries] = await Promise.all([
    db.class.findMany({ orderBy: { name: "asc" } }),
    db.teacher.findMany({
      orderBy: { name: "asc" },
      where: { isAvailable: true },
    }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
    db.room.findMany({
      orderBy: { name: "asc" },
      where: { isAvailable: true },
    }),
    db.timeSlot.findMany({
      orderBy: [{ day: "asc" }, { period: "asc" }],
    }),
    db.timetableEntry.findMany({
      include: {
        class: true,
        teacher: true,
        subject: true,
        room: true,
        timeSlot: true,
      },
    }),
  ]);

  return { classes, teachers, subjects, rooms, timeSlots, entries };
}

export default async function TimetablePage() {
  const data = await getData();

  return <TimetableClient {...data} />;
}
