import { db } from "@/lib/db";
import { StudentsClient } from "./client";

async function getStudents() {
  const students = await db.student.findMany({
    orderBy: [{ class: { name: "asc" } }, { rollNumber: "asc" }],
    include: {
      class: {
        select: {
          id: true,
          name: true,
          program: true,
          year: true,
          division: true,
        },
      },
    },
  });
  return students;
}

async function getClasses() {
  return db.class.findMany({
    orderBy: [{ program: "asc" }, { year: "asc" }, { division: "asc" }],
    select: {
      id: true,
      name: true,
      program: true,
      year: true,
      division: true,
    },
  });
}

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([getStudents(), getClasses()]);

  return <StudentsClient data={students} classes={classes} />;
}
