"use client";

import { motion } from "framer-motion";
import { Calendar, Building2, GraduationCap, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { cn } from "@/lib/utils";

type Teacher = {
  id: string;
  name: string;
  employeeId: string;
} | null;

type TimetableEntry = {
  id: string;
  class: { id: string; name: string; program: string };
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

interface MyScheduleClientProps {
  teacher: Teacher;
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

export function MyScheduleClient({ teacher, entries, timeSlots }: MyScheduleClientProps) {
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
    ];
    return colors[code.charCodeAt(0) % colors.length];
  };

  const todayClasses = entries.filter(
    (e) => e.timeSlot.day === DAYS[new Date().getDay() - 1]
  );

  if (!teacher) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md text-center p-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Teacher Profile</h2>
            <p className="text-muted-foreground">
              Your account is not linked to a teacher profile. Please contact the
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
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">
            Welcome, {teacher.name} ({teacher.employeeId})
          </p>
        </div>

        {/* Today's Classes */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today&apos;s Classes ({DAY_LABELS[DAYS[new Date().getDay() - 1]] || "Weekend"})
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
                          <GraduationCap className="h-3 w-3" />
                          {entry.class.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {entry.room.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No classes scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Schedule
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
                        className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border"
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
                              className="p-2 border-b border-border"
                            >
                              {entry ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={cn(
                                    "p-2 rounded-lg border text-center",
                                    getSubjectColor(entry.subject.code)
                                  )}
                                >
                                  <div className="font-medium text-sm">
                                    {entry.subject.code}
                                  </div>
                                  <div className="text-xs opacity-80">
                                    {entry.class.name}
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

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Classes per Week</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {new Set(entries.map((e) => e.class.id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Different Classes</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {new Set(entries.map((e) => e.room.id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Different Rooms</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
