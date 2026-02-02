import { db } from "@/lib/db";
import { TeachersClient } from "./client";

async function getTeachers() {
  const teachers = await db.teacher.findMany({
    orderBy: { name: "asc" },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
      _count: {
        select: { timetableEntries: true },
      },
    },
  });
  return teachers;
}

async function getSubjects() {
  return db.subject.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function TeachersPage() {
  const [teachers, subjects] = await Promise.all([getTeachers(), getSubjects()]);

  return <TeachersClient data={teachers} subjects={subjects} />;
}
