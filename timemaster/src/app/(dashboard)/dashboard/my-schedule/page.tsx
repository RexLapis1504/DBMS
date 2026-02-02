import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MyScheduleClient } from "./client";

async function getTeacherSchedule(userId: string) {
  const teacher = await db.teacher.findFirst({
    where: { userId },
  });

  if (!teacher) return { teacher: null, entries: [], timeSlots: [] };

  const entries = await db.timetableEntry.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: true,
      subject: true,
      room: true,
      timeSlot: true,
    },
  });

  const timeSlots = await db.timeSlot.findMany({
    orderBy: [{ day: "asc" }, { period: "asc" }],
  });

  return { teacher, entries, timeSlots };
}

export default async function MySchedulePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  const data = await getTeacherSchedule(session.user.id);

  return <MyScheduleClient {...data} />;
}
