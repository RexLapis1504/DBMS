"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  GraduationCap,
  Beaker,
  BookMarked,
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

type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  subjectType: "THEORY" | "PRACTICAL" | "TUTORIAL";
  _count: {
    teachers: number;
    timetableEntries: number;
  };
};

interface SubjectsClientProps {
  data: Subject[];
}

export function SubjectsClient({ data }: SubjectsClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: 3,
    subjectType: "THEORY" as Subject["subjectType"],
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      credits: 3,
      subjectType: "THEORY",
    });
    setEditingSubject(null);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      subjectType: subject.subjectType,
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Subject code and name are required");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingSubject
        ? `/api/subjects/${editingSubject.id}`
        : "/api/subjects";
      const method = editingSubject ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save subject");
      }

      toast.success(editingSubject ? "Subject updated" : "Subject created");
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
    if (!deleteSubject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/subjects/${deleteSubject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete subject");
      }

      toast.success("Subject deleted");
      setDeleteSubject(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectTypeIcon = (type: Subject["subjectType"]) => {
    switch (type) {
      case "THEORY":
        return <BookMarked className="h-4 w-4" />;
      case "PRACTICAL":
        return <Beaker className="h-4 w-4" />;
      case "TUTORIAL":
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getSubjectTypeBadgeClass = (type: Subject["subjectType"]) => {
    switch (type) {
      case "THEORY":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "PRACTICAL":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "TUTORIAL":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono font-medium">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "subjectType",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={getSubjectTypeBadgeClass(row.original.subjectType)}
        >
          {getSubjectTypeIcon(row.original.subjectType)}
          <span className="ml-1 capitalize">
            {row.original.subjectType.toLowerCase()}
          </span>
        </Badge>
      ),
    },
    {
      accessorKey: "credits",
      header: "Credits",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.credits} Cr
        </Badge>
      ),
    },
    {
      accessorKey: "_count.teachers",
      header: "Teachers",
      cell: ({ row }) => row.original._count.teachers,
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
              onClick={() => setDeleteSubject(row.original)}
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
            <h1 className="text-2xl font-bold">Subjects</h1>
            <p className="text-muted-foreground">
              Manage subjects and courses offered
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
              Add Subject
            </Button>
          </motion.div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              All Subjects ({data.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data}
              searchKey="name"
              searchPlaceholder="Search subjects..."
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription>
                {editingSubject
                  ? "Update the subject details below"
                  : "Fill in the details to create a new subject"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CS101"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="bg-secondary/50 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: parseInt(e.target.value) || 1,
                      })
                    }
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Structures"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectType">Subject Type</Label>
                <Select
                  value={formData.subjectType}
                  onValueChange={(value: Subject["subjectType"]) =>
                    setFormData({ ...formData, subjectType: value })
                  }
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THEORY">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4" />
                        Theory
                      </div>
                    </SelectItem>
                    <SelectItem value="PRACTICAL">
                      <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4" />
                        Practical
                      </div>
                    </SelectItem>
                    <SelectItem value="TUTORIAL">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Tutorial
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                {isLoading ? "Saving..." : editingSubject ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteSubject} onOpenChange={() => setDeleteSubject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Subject</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deleteSubject?.name}&quot;
                ({deleteSubject?.code})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteSubject(null)}
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
