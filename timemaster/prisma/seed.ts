import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter and client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Note: Users are now created via Clerk webhooks when they sign up.
  // We no longer seed users directly since Clerk handles authentication.
  // After signing up in Clerk, update user roles via the database or admin panel.

  // Create Rooms (from original SQL)
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { name: "C101" },
      update: {},
      create: { name: "C101", capacity: 100, roomType: "CLASSROOM", building: "Block C", floor: 1 },
    }),
    prisma.room.upsert({
      where: { name: "C102" },
      update: {},
      create: { name: "C102", capacity: 50, roomType: "CLASSROOM", building: "Block C", floor: 1 },
    }),
    prisma.room.upsert({
      where: { name: "C103" },
      update: {},
      create: { name: "C103", capacity: 50, roomType: "CLASSROOM", building: "Block C", floor: 1 },
    }),
    prisma.room.upsert({
      where: { name: "L201" },
      update: {},
      create: { name: "L201", capacity: 30, roomType: "LAB", building: "Block L", floor: 2 },
    }),
    prisma.room.upsert({
      where: { name: "L202" },
      update: {},
      create: { name: "L202", capacity: 30, roomType: "LAB", building: "Block L", floor: 2 },
    }),
    prisma.room.upsert({
      where: { name: "L203" },
      update: {},
      create: { name: "L203", capacity: 30, roomType: "LAB", building: "Block L", floor: 2 },
    }),
    prisma.room.upsert({
      where: { name: "C301" },
      update: {},
      create: { name: "C301", capacity: 60, roomType: "CLASSROOM", building: "Block C", floor: 3 },
    }),
    prisma.room.upsert({
      where: { name: "C302" },
      update: {},
      create: { name: "C302", capacity: 60, roomType: "CLASSROOM", building: "Block C", floor: 3 },
    }),
    prisma.room.upsert({
      where: { name: "C303" },
      update: {},
      create: { name: "C303", capacity: 60, roomType: "CLASSROOM", building: "Block C", floor: 3 },
    }),
  ]);
  console.log(`Created ${rooms.length} rooms`);

  // Create Subjects (from original SQL)
  const subjectsData = [
    { code: "BEEE", name: "Basic Electrical and Electronics Engineering" },
    { code: "DLD", name: "Digital Logic Design" },
    { code: "CN", name: "Computer Networks" },
    { code: "PPS", name: "Programming for Problem Solving" },
    { code: "OOPJ", name: "Object Oriented Programming with Java" },
    { code: "EC", name: "Engineering Chemistry" },
    { code: "EGD", name: "Engineering Graphics and Design" },
    { code: "PS", name: "Probability and Statistics" },
    { code: "WP", name: "Web Programming" },
    { code: "MM", name: "Mathematical Methods" },
    { code: "DAA", name: "Design and Analysis of Algorithms" },
    { code: "DSA", name: "Data Structures and Algorithms" },
    { code: "DBMS", name: "Database Management Systems" },
    { code: "MAE", name: "Mechanical and Aerospace Engineering" },
    { code: "EOB", name: "Elements of Biology" },
    { code: "COA", name: "Computer Organization and Architecture" },
    { code: "COI", name: "Computational Intelligence" },
  ];

  const subjects = await Promise.all(
    subjectsData.map((s) =>
      prisma.subject.upsert({
        where: { code: s.code },
        update: {},
        create: s,
      })
    )
  );
  console.log(`Created ${subjects.length} subjects`);

  // Create Teachers (from original SQL)
  const teachersData = [
    { employeeId: "EMP001", name: "Prof. Divyang Sharma", email: "divyang@nmims.edu", department: "Electrical", designation: "Associate Professor" },
    { employeeId: "EMP002", name: "Prof. Yogesh Patil", email: "yogesh@nmims.edu", department: "Computer Science", designation: "Assistant Professor" },
    { employeeId: "EMP003", name: "Prof. Asha Kulkarni", email: "asha@nmims.edu", department: "Computer Science", designation: "Associate Professor" },
    { employeeId: "EMP004", name: "Prof. Tejaswini Joshi", email: "tejaswini@nmims.edu", department: "Computer Science", designation: "Assistant Professor" },
    { employeeId: "EMP005", name: "Prof. Aparna Desai", email: "aparna@nmims.edu", department: "Chemistry", designation: "Professor" },
    { employeeId: "EMP006", name: "Prof. Sandeep Kumar", email: "sandeep@nmims.edu", department: "Computer Science", designation: "Assistant Professor" },
    { employeeId: "EMP007", name: "Prof. Kasar Singh", email: "kasar@nmims.edu", department: "Mechanical", designation: "Associate Professor" },
    { employeeId: "EMP008", name: "Prof. Jyoti Mehta", email: "jyoti@nmims.edu", department: "Mathematics", designation: "Assistant Professor" },
    { employeeId: "EMP009", name: "Prof. Preeti Gupta", email: "preetigupta@nmims.edu", department: "Computer Science", designation: "Assistant Professor" },
    { employeeId: "EMP010", name: "Prof. Preeti Godbole", email: "preetigodbole@nmims.edu", department: "Mathematics", designation: "Associate Professor" },
    { employeeId: "EMP011", name: "Prof. Preeti Agarwal", email: "preetiagar@nmims.edu", department: "Computer Science", designation: "Assistant Professor" },
  ];

  const teachers = await Promise.all(
    teachersData.map((t) =>
      prisma.teacher.upsert({
        where: { email: t.email },
        update: {},
        create: t,
      })
    )
  );
  console.log(`Created ${teachers.length} teachers`);

  // Assign subjects to teachers
  const teacherSubjectMap = [
    { teacherEmail: "divyang@nmims.edu", subjectCode: "BEEE" },
    { teacherEmail: "yogesh@nmims.edu", subjectCode: "CN" },
    { teacherEmail: "asha@nmims.edu", subjectCode: "DBMS" },
    { teacherEmail: "tejaswini@nmims.edu", subjectCode: "OOPJ" },
    { teacherEmail: "aparna@nmims.edu", subjectCode: "EC" },
    { teacherEmail: "sandeep@nmims.edu", subjectCode: "DSA" },
    { teacherEmail: "kasar@nmims.edu", subjectCode: "EGD" },
    { teacherEmail: "jyoti@nmims.edu", subjectCode: "PS" },
    { teacherEmail: "preetigupta@nmims.edu", subjectCode: "DAA" },
    { teacherEmail: "preetigodbole@nmims.edu", subjectCode: "MM" },
    { teacherEmail: "preetiagar@nmims.edu", subjectCode: "WP" },
  ];

  for (const ts of teacherSubjectMap) {
    const teacher = await prisma.teacher.findUnique({ where: { email: ts.teacherEmail } });
    const subject = await prisma.subject.findUnique({ where: { code: ts.subjectCode } });
    if (teacher && subject) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: subject.id } },
        update: {},
        create: { teacherId: teacher.id, subjectId: subject.id },
      });
    }
  }
  console.log("Assigned subjects to teachers");

  // Create Classes (from original SQL)
  const classesData = [
    { name: "MBA Tech 2024", program: "MBA Tech", year: 1, semester: 1, strength: 60, division: "A" },
    { name: "BTech CE 2024", program: "BTech CE", year: 1, semester: 1, strength: 60, division: "A" },
    { name: "BTech AIDS 2024", program: "BTech AIDS", year: 1, semester: 1, strength: 60, division: "A" },
    { name: "BTech CSBS 2024", program: "BTech CSBS", year: 1, semester: 1, strength: 60, division: "A" },
  ];

  const classes = await Promise.all(
    classesData.map((c) =>
      prisma.class.upsert({
        where: { name: c.name },
        update: {},
        create: c,
      })
    )
  );
  console.log(`Created ${classes.length} classes`);

  // Create Time Slots
  const timeSlotData = [];
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
  const periods = [
    { period: 1, startTime: "09:00", endTime: "10:00" },
    { period: 2, startTime: "10:00", endTime: "11:00" },
    { period: 3, startTime: "11:15", endTime: "12:15" },
    { period: 4, startTime: "12:15", endTime: "13:15" },
    { period: 5, startTime: "14:00", endTime: "15:00" },
    { period: 6, startTime: "15:00", endTime: "16:00" },
  ];

  for (const day of days) {
    for (const p of periods) {
      timeSlotData.push({
        day,
        period: p.period,
        startTime: p.startTime,
        endTime: p.endTime,
      });
    }
  }

  const timeSlots = await Promise.all(
    timeSlotData.map((ts) =>
      prisma.timeSlot.upsert({
        where: { day_period: { day: ts.day, period: ts.period } },
        update: {},
        create: ts,
      })
    )
  );
  console.log(`Created ${timeSlots.length} time slots`);

  // Create sample students (from original SQL)
  const studentNames = [
    "Aarav", "Aditi", "Amit", "Ananya", "Arjun", "Avni", "Deepak", "Divya",
    "Gaurav", "Ishaan", "Kavya", "Krishna", "Manisha", "Maya", "Mohit",
    "Neha", "Pranav", "Priya", "Rahul", "Riya", "Rohit", "Sakshi", "Sanjay",
    "Shreya", "Siddharth", "Sneha", "Tanvi", "Vikram", "Zoya", "Shubhan",
  ];

  let studentIndex = 1;
  for (const cls of classes) {
    const studentsForClass = studentNames.slice((studentIndex - 1) * 7, studentIndex * 7 + 1);
    for (let i = 0; i < studentsForClass.length; i++) {
      const name = studentsForClass[i];
      if (!name) continue;

      const rollNumber = `${cls.program.replace(/\s/g, "").substring(0, 4).toUpperCase()}${String(studentIndex * 10 + i + 1).padStart(3, "0")}`;
      const email = `${name.toLowerCase()}.${rollNumber.toLowerCase()}@nmims.edu`;

      await prisma.student.upsert({
        where: { rollNumber },
        update: {},
        create: {
          rollNumber,
          name,
          email,
          classId: cls.id,
        },
      });
    }
    studentIndex++;
  }
  console.log("Created sample students");

  console.log("Seed completed successfully!");
  console.log("");
  console.log("NOTE: Users are now created via Clerk. To make a user an admin:");
  console.log("1. Sign up via the Clerk UI (/sign-up)");
  console.log("2. Update the user's role in the database:");
  console.log("   UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-email@example.com';");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
