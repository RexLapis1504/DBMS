import { db } from "@/lib/db";
import { ClassesClient } from "./client";

async function getClasses() {
  const classes = await db.class.findMany({
    orderBy: [{ program: "asc" }, { year: "asc" }, { division: "asc" }],
    include: {
      _count: {
        select: {
          students: true,
          timetableEntries: true,
        },
      },
    },
  });
  return classes;
}

export default async function ClassesPage() {
  const classes = await getClasses();

  return <ClassesClient data={classes} />;
}
