"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { PageTransition } from "@/components/motion";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

type TimeSlot = {
  id: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  _count: {
    timetableEntries: number;
  };
};

interface TimeSlotsClientProps {
  data: TimeSlot[];
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
];

export function TimeSlotsClient({ data }: TimeSlotsClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [deleteTimeSlot, setDeleteTimeSlot] = useState<TimeSlot | null>(null);

  const [formData, setFormData] = useState({
    day: "MONDAY" as DayOfWeek,
    period: 1,
    startTime: "09:00",
    endTime: "10:00",
  });

  const resetForm = () => {
    setFormData({
      day: "MONDAY",
      period: 1,
      startTime: "09:00",
      endTime: "10:00",
    });
    setEditingTimeSlot(null);
  };

  const openEditDialog = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setFormData({
      day: timeSlot.day,
      period: timeSlot.period,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.startTime || !formData.endTime) {
      toast.error("Start time and end time are required");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingTimeSlot
        ? `/api/timeslots/${editingTimeSlot.id}`
        : "/api/timeslots";
      const method = editingTimeSlot ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save time slot");
      }

      toast.success(editingTimeSlot ? "Time slot updated" : "Time slot created");
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
    if (!deleteTimeSlot) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/timeslots/${deleteTimeSlot.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete time slot");
      }

      toast.success("Time slot deleted");
      setDeleteTimeSlot(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (day: DayOfWeek) => {
    return DAYS_OF_WEEK.find((d) => d.value === day)?.label || day;
  };

  const getDayShort = (day: DayOfWeek) => {
    return DAYS_OF_WEEK.find((d) => d.value === day)?.short || day;
  };

  const getDayBadgeClass = (day: DayOfWeek) => {
    const colors: Record<DayOfWeek, string> = {
      MONDAY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      TUESDAY: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      WEDNESDAY: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      THURSDAY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      FRIDAY: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      SATURDAY: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    return colors[day];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const columns: ColumnDef<TimeSlot>[] = [
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <Badge
            variant="secondary"
            className={getDayBadgeClass(row.original.day)}
          >
            {getDayLabel(row.original.day)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          Period {row.original.period}
        </Badge>
      ),
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{formatTime(row.original.startTime)}</span>
        </div>
      ),
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{formatTime(row.original.endTime)}</span>
        </div>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const start = row.original.startTime.split(":");
        const end = row.original.endTime.split(":");
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        const duration = endMinutes - startMinutes;
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        return (
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>
              {hours > 0 ? `${hours}h ` : ""}
              {mins > 0 ? `${mins}m` : ""}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "_count.timetableEntries",
      header: "Schedules",
      cell: ({ row }) => row.original._count.timetableEntries,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteTimeSlot(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Time Slots</h1>
            <p className="text-muted-foreground">
              Manage scheduling periods and time slots
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </motion.div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              All Time Slots ({data.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data}
              searchKey="day"
              searchPlaceholder="Search by day..."
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTimeSlot ? "Edit Time Slot" : "Add New Time Slot"}
              </DialogTitle>
              <DialogDescription>
                {editingTimeSlot
                  ? "Update the time slot details below"
                  : "Fill in the details to create a new time slot"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day of Week</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value: DayOfWeek) =>
                      setFormData({ ...formData, day: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {day.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period Number</Label>
                  <Select
                    value={formData.period.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, period: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          Period {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Preview:</strong> {getDayShort(formData.day)}, Period{" "}
                  {formData.period} ({formatTime(formData.startTime)} -{" "}
                  {formatTime(formData.endTime)})
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Saving..." : editingTimeSlot ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTimeSlot} onOpenChange={() => setDeleteTimeSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Time Slot</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the time slot for{" "}
                {deleteTimeSlot && getDayLabel(deleteTimeSlot.day)} Period{" "}
                {deleteTimeSlot?.period}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTimeSlot(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
