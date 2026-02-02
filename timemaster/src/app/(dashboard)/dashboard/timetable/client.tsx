"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Filter,
  Trash2,
  ChevronDown,
  Building2,
  UserCog,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/motion";
import { cn } from "@/lib/utils";

type Class = { id: string; name: string; program: string };
type Teacher = { id: string; name: string; employeeId: string };
type Subject = { id: string; name: string; code: string };
type Room = { id: string; name: string; capacity: number };
type TimeSlot = { id: string; day: string; period: number; startTime: string; endTime: string };
type TimetableEntry = {
  id: string;
  class: Class;
  teacher: Teacher;
  subject: Subject;
  room: Room;
  timeSlot: TimeSlot;
};

interface TimetableClientProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  entries: TimetableEntry[];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export function TimetableClient({
  classes,
  teachers,
  subjects,
  rooms,
  timeSlots,
  entries,
}: TimetableClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || "");
  const [viewMode, setViewMode] = useState<"class" | "teacher" | "room">("class");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [deleteEntry, setDeleteEntry] = useState<TimetableEntry | null>(null);

  const [formData, setFormData] = useState({
    classId: "",
    teacherId: "",
    subjectId: "",
    roomId: "",
    timeSlotId: "",
  });

  // Get unique periods sorted
  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(timeSlots.map((ts) => ts.period))].sort(
      (a, b) => a - b
    );
    return uniquePeriods;
  }, [timeSlots]);

  // Filter entries based on view mode
  const filteredEntries = useMemo(() => {
    if (viewMode === "class" && selectedClass) {
      return entries.filter((e) => e.class.id === selectedClass);
    }
    if (viewMode === "teacher" && selectedFilter) {
      return entries.filter((e) => e.teacher.id === selectedFilter);
    }
    if (viewMode === "room" && selectedFilter) {
      return entries.filter((e) => e.room.id === selectedFilter);
    }
    return entries;
  }, [entries, viewMode, selectedClass, selectedFilter]);

  // Get time slot by day and period
  const getTimeSlot = (day: string, period: number) => {
    return timeSlots.find((ts) => ts.day === day && ts.period === period);
  };

  // Get entry for a specific slot
  const getEntryForSlot = (day: string, period: number) => {
    const timeSlot = getTimeSlot(day, period);
    if (!timeSlot) return null;
    return filteredEntries.find((e) => e.timeSlot.id === timeSlot.id);
  };

  const resetForm = () => {
    setFormData({
      classId: selectedClass || classes[0]?.id || "",
      teacherId: "",
      subjectId: "",
      roomId: "",
      timeSlotId: "",
    });
  };

  const handleSubmit = async () => {
    const { classId, teacherId, subjectId, roomId, timeSlotId } = formData;
    if (!classId || !teacherId || !subjectId || !roomId || !timeSlotId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create entry");
      }

      toast.success("Timetable entry created");
      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/timetable/${deleteEntry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete entry");
      }

      toast.success("Entry deleted");
      setDeleteEntry(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectColor = (subjectCode: string) => {
    const colors = [
      "bg-violet-500/20 border-violet-500/30 text-violet-300",
      "bg-blue-500/20 border-blue-500/30 text-blue-300",
      "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
      "bg-amber-500/20 border-amber-500/30 text-amber-300",
      "bg-rose-500/20 border-rose-500/30 text-rose-300",
      "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
      "bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300",
    ];
    const index = subjectCode.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Timetable</h1>
            <p className="text-muted-foreground">
              Manage class schedules and view timetables
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
              className="bg-primary hover:bg-primary/90"
              disabled={timeSlots.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </motion.div>
        </div>

        {/* View Mode Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => {
            setViewMode(v as typeof viewMode);
            setSelectedFilter("");
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="class" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                By Class
              </TabsTrigger>
              <TabsTrigger value="teacher" className="gap-2">
                <UserCog className="h-4 w-4" />
                By Teacher
              </TabsTrigger>
              <TabsTrigger value="room" className="gap-2">
                <Building2 className="h-4 w-4" />
                By Room
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            {viewMode === "class" && (
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px] bg-secondary/50">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {viewMode === "teacher" && (
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[200px] bg-secondary/50">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {viewMode === "room" && (
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[200px] bg-secondary/50">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value={viewMode} className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {timeSlots.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No time slots configured</p>
                    <p className="text-sm">
                      Add time slots first to create the timetable grid
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/dashboard/timeslots")}
                    >
                      Configure Time Slots
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-secondary/30">
                          <th className="p-3 text-left text-sm font-medium text-muted-foreground border-b border-border w-20">
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
                            <tr key={period} className="hover:bg-secondary/10">
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
                                const timeSlot = getTimeSlot(day, period);

                                return (
                                  <td
                                    key={`${day}-${period}`}
                                    className="p-2 border-b border-border min-w-[120px]"
                                  >
                                    <AnimatePresence mode="wait">
                                      {entry ? (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          className={cn(
                                            "p-2 rounded-lg border cursor-pointer transition-all hover:scale-105",
                                            getSubjectColor(entry.subject.code)
                                          )}
                                          onClick={() => setDeleteEntry(entry)}
                                        >
                                          <div className="font-medium text-sm">
                                            {entry.subject.code}
                                          </div>
                                          <div className="text-xs opacity-80 truncate">
                                            {viewMode !== "teacher" && entry.teacher.name}
                                            {viewMode !== "room" && ` • ${entry.room.name}`}
                                            {viewMode !== "class" && entry.class.name}
                                          </div>
                                        </motion.div>
                                      ) : timeSlot ? (
                                        <motion.button
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="w-full h-16 rounded-lg border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center"
                                          onClick={() => {
                                            setFormData({
                                              ...formData,
                                              classId: selectedClass || classes[0]?.id || "",
                                              timeSlotId: timeSlot.id,
                                            });
                                            setIsOpen(true);
                                          }}
                                        >
                                          <Plus className="h-4 w-4 text-muted-foreground" />
                                        </motion.button>
                                      ) : (
                                        <div className="w-full h-16 rounded-lg bg-secondary/20" />
                                      )}
                                    </AnimatePresence>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Entry Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Timetable Entry</DialogTitle>
              <DialogDescription>
                Schedule a class for the selected time slot
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(v) => setFormData({ ...formData, classId: v })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.program})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({ ...formData, subjectId: v })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(v) => setFormData({ ...formData, teacherId: v })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(v) => setFormData({ ...formData, roomId: v })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} (Cap: {room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Slot</Label>
                <Select
                  value={formData.timeSlotId}
                  onValueChange={(v) => setFormData({ ...formData, timeSlotId: v })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {DAY_LABELS[slot.day]} Period {slot.period} ({slot.startTime}-{slot.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? "Creating..." : "Create Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Entry</DialogTitle>
              <DialogDescription>
                Remove {deleteEntry?.subject.code} ({deleteEntry?.teacher.name}) from this slot?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEntry(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? "Removing..." : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
