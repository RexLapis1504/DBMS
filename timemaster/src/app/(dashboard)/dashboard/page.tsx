import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

async function getStats() {
  const [roomCount, teacherCount, subjectCount, classCount, studentCount] =
    await Promise.all([
      db.room.count(),
      db.teacher.count(),
      db.subject.count(),
      db.class.count(),
      db.student.count(),
    ]);

  return {
    rooms: roomCount,
    teachers: teacherCount,
    subjects: subjectCount,
    classes: classCount,
    students: studentCount,
  };
}

async function getRecentActivity() {
  const recentClasses = await db.class.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { students: true, timetableEntries: true },
      },
    },
  });

  return recentClasses;
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats();
  const recentActivity = await getRecentActivity();

  return (
    <DashboardContent
      user={{
        name: session?.user?.name || "User",
        role: session?.user?.role || "STUDENT",
      }}
      stats={stats}
      recentActivity={recentActivity}
    />
  );
}
