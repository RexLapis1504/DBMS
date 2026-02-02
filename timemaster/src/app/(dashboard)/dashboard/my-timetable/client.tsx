"use client";

import { motion } from "framer-motion";
import { Calendar, Building2, UserCog, BookOpen, Clock, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { cn } from "@/lib/utils";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  class: { id: string; name: string; program: string };
} | null;

type TimetableEntry = {
  id: string;
  teacher: { id: string; name: string };
  subject: { id: string; name: string; code: string };
  room: { id: string; name: string };
  timeSlot: { id: string; day: string; period: number; startTime: string; endTime: string };
};

type TimeSlot = {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
};

interface MyTimetableClientProps {
  student: Student;
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export function MyTimetableClient({ student, entries, timeSlots }: MyTimetableClientProps) {
  const periods = [...new Set(timeSlots.map((ts) => ts.period))].sort((a, b) => a - b);

  const getTimeSlot = (day: string, period: number) => {
    return timeSlots.find((ts) => ts.day === day && ts.period === period);
  };

  const getEntryForSlot = (day: string, period: number) => {
    const timeSlot = getTimeSlot(day, period);
    if (!timeSlot) return null;
    return entries.find((e) => e.timeSlot.id === timeSlot.id);
  };

  const getSubjectColor = (code: string) => {
    const colors = [
      "bg-violet-500/20 border-violet-500/30 text-violet-300",
      "bg-blue-500/20 border-blue-500/30 text-blue-300",
      "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
      "bg-amber-500/20 border-amber-500/30 text-amber-300",
      "bg-rose-500/20 border-rose-500/30 text-rose-300",
      "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
    ];
    return colors[code.charCodeAt(0) % colors.length];
  };

  const todayDay = DAYS[new Date().getDay() - 1];
  const todayClasses = entries.filter((e) => e.timeSlot.day === todayDay);

  if (!student) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md text-center p-8">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Student Profile</h2>
            <p className="text-muted-foreground">
              Your account is not linked to a student profile. Please contact the
              administrator.
            </p>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Timetable</h1>
            <p className="text-muted-foreground">
              {student.name} - {student.rollNumber}
            </p>
          </div>
          <Badge className="w-fit px-4 py-2 bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="h-4 w-4 mr-2" />
            {student.class.name}
          </Badge>
        </div>

        {/* Today's Schedule */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today&apos;s Schedule ({DAY_LABELS[todayDay] || "Weekend"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayClasses
                  .sort((a, b) => a.timeSlot.period - b.timeSlot.period)
                  .map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-lg border",
                        getSubjectColor(entry.subject.code)
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Period {entry.timeSlot.period}
                        </Badge>
                        <span className="text-xs opacity-70">
                          {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                        </span>
                      </div>
                      <h3 className="font-semibold">{entry.subject.code}</h3>
                      <p className="text-sm opacity-80">{entry.subject.name}</p>
                      <div className="mt-3 space-y-1 text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          <UserCog className="h-3 w-3" />
                          {entry.teacher.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Room {entry.room.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {todayDay ? "No classes scheduled for today" : "It's the weekend!"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Full Weekly Timetable */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Timetable
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-secondary/30">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground border-b border-border w-24">
                      Period
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className={cn(
                          "p-3 text-center text-sm font-medium border-b border-border",
                          day === todayDay
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        )}
                      >
                        {DAY_LABELS[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    const slot = timeSlots.find((ts) => ts.period === period);
                    return (
                      <tr key={period}>
                        <td className="p-3 text-sm text-muted-foreground border-b border-border">
                          <div className="font-medium">Period {period}</div>
                          {slot && (
                            <div className="text-xs">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          )}
                        </td>
                        {DAYS.map((day) => {
                          const entry = getEntryForSlot(day, period);
                          return (
                            <td
                              key={`${day}-${period}`}
                              className={cn(
                                "p-2 border-b border-border",
                                day === todayDay && "bg-primary/5"
                              )}
                            >
                              {entry ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={cn(
                                    "p-2 rounded-lg border",
                                    getSubjectColor(entry.subject.code)
                                  )}
                                >
                                  <div className="font-medium text-sm">
                                    {entry.subject.code}
                                  </div>
                                  <div className="text-xs opacity-80 truncate">
                                    {entry.teacher.name}
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {entry.room.name}
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="h-16 rounded-lg bg-secondary/20" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {new Set(entries.map((e) => e.subject.id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <UserCog className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {new Set(entries.map((e) => e.teacher.id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Classes per Week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
