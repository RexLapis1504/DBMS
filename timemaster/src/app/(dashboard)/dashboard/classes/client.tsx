"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  GraduationCap,
  Users,
  Calendar,
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

type Class = {
  id: string;
  name: string;
  program: string;
  year: number;
  division: string | null;
  semester: number;
  strength: number;
  _count: {
    students: number;
    timetableEntries: number;
  };
};

interface ClassesClientProps {
  data: Class[];
}

export function ClassesClient({ data }: ClassesClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteClass, setDeleteClass] = useState<Class | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    program: "",
    year: 1,
    division: "",
    semester: 1,
    strength: 60,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      program: "",
      year: 1,
      division: "",
      semester: 1,
      strength: 60,
    });
    setEditingClass(null);
  };

  const openEditDialog = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      program: classItem.program,
      year: classItem.year,
      division: classItem.division || "",
      semester: classItem.semester,
      strength: classItem.strength,
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.program) {
      toast.error("Class name and program are required");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingClass
        ? `/api/classes/${editingClass.id}`
        : "/api/classes";
      const method = editingClass ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save class");
      }

      toast.success(editingClass ? "Class updated" : "Class created");
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
    if (!deleteClass) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes/${deleteClass.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete class");
      }

      toast.success("Class deleted");
      setDeleteClass(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getYearBadgeClass = (year: number) => {
    const colors = [
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "bg-amber-500/20 text-amber-400 border-amber-500/30",
    ];
    return colors[(year - 1) % colors.length];
  };

  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: "name",
      header: "Class",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.program}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => (
        <Badge variant="secondary" className={getYearBadgeClass(row.original.year)}>
          Year {row.original.year}
        </Badge>
      ),
    },
    {
      accessorKey: "division",
      header: "Division",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.division || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "semester",
      header: "Semester",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Sem {row.original.semester}</span>
        </div>
      ),
    },
    {
      accessorKey: "strength",
      header: "Strength",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.strength}</span>
        </div>
      ),
    },
    {
      accessorKey: "_count.students",
      header: "Students",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span>
            {row.original._count.students}/{row.original.strength}
          </span>
        </div>
      ),
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
              onClick={() => setDeleteClass(row.original)}
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
            <h1 className="text-2xl font-bold">Classes</h1>
            <p className="text-muted-foreground">
              Manage class sections and divisions
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
              Add Class
            </Button>
          </motion.div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-primary" />
              All Classes ({data.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data}
              searchKey="name"
              searchPlaceholder="Search classes..."
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
              <DialogDescription>
                {editingClass
                  ? "Update the class details below"
                  : "Fill in the details to create a new class"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., BTech CE Year 2 Div A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Input
                  id="program"
                  placeholder="e.g., BTech CE, MBA Tech"
                  value={formData.program}
                  onChange={(e) =>
                    setFormData({ ...formData, program: e.target.value })
                  }
                  className="bg-secondary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    placeholder="e.g., A, B, C"
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value.toUpperCase() })
                    }
                    className="bg-secondary/50"
                    maxLength={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, semester: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    type="number"
                    min={1}
                    max={200}
                    value={formData.strength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        strength: parseInt(e.target.value) || 1,
                      })
                    }
                    className="bg-secondary/50"
                  />
                </div>
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
                {isLoading ? "Saving..." : editingClass ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteClass} onOpenChange={() => setDeleteClass(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Class</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deleteClass?.name}&quot;? This
                will also remove all associated student enrollments. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteClass(null)}
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
