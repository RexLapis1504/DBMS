import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MyTimetableClient } from "./client";

async function getStudentTimetable(userId: string) {
  const student = await db.student.findFirst({
    where: { userId },
    include: {
      class: true,
    },
  });

  if (!student) return { student: null, entries: [], timeSlots: [] };

  const entries = await db.timetableEntry.findMany({
    where: { classId: student.classId },
    include: {
      subject: true,
      teacher: true,
      room: true,
      timeSlot: true,
    },
  });

  const timeSlots = await db.timeSlot.findMany({
    orderBy: [{ day: "asc" }, { period: "asc" }],
  });

  return { student, entries, timeSlots };
}

export default async function MyTimetablePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const data = await getStudentTimetable(session.user.id);

  return <MyTimetableClient {...data} />;
}
