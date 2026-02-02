import { db } from "@/lib/db";
import { SubjectsClient } from "./client";

async function getSubjects() {
  const subjects = await db.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          teachers: true,
          timetableEntries: true,
        },
      },
    },
  });
  return subjects;
}

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return <SubjectsClient data={subjects} />;
}
