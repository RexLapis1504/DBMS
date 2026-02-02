"use client";

import { motion } from "framer-motion";
import {
  Building2,
  UserCog,
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";

interface DashboardContentProps {
  user: {
    name: string;
    role: string;
  };
  stats: {
    rooms: number;
    teachers: number;
    subjects: number;
    classes: number;
    students: number;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    program: string;
    _count: {
      students: number;
      timetableEntries: number;
    };
  }>;
}

const statCards = [
  { key: "rooms", label: "Rooms", icon: Building2, color: "from-violet-500/20 to-violet-500/5" },
  { key: "teachers", label: "Teachers", icon: UserCog, color: "from-blue-500/20 to-blue-500/5" },
  { key: "subjects", label: "Subjects", icon: BookOpen, color: "from-emerald-500/20 to-emerald-500/5" },
  { key: "classes", label: "Classes", icon: GraduationCap, color: "from-amber-500/20 to-amber-500/5" },
  { key: "students", label: "Students", icon: Users, color: "from-rose-500/20 to-rose-500/5" },
];

export function DashboardContent({
  user,
  stats,
  recentActivity,
}: DashboardContentProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting()}, <span className="gradient-text">{user.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your TimeMaster dashboard
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit px-4 py-2 bg-primary/10 text-primary border border-primary/20"
          >
            <Clock className="h-4 w-4 mr-2" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <StaggerItem key={stat.key}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <motion.p
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="text-2xl font-bold"
                        >
                          {stats[stat.key as keyof typeof stats]}
                        </motion.p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {user.role === "ADMIN" && (
                    <>
                      <QuickActionCard
                        href="/dashboard/timetable"
                        icon={Calendar}
                        title="Manage Timetable"
                        description="Create and edit class schedules"
                      />
                      <QuickActionCard
                        href="/dashboard/teachers"
                        icon={UserCog}
                        title="Manage Teachers"
                        description="Add or modify faculty details"
                      />
                      <QuickActionCard
                        href="/dashboard/rooms"
                        icon={Building2}
                        title="Manage Rooms"
                        description="Configure classrooms and labs"
                      />
                      <QuickActionCard
                        href="/dashboard/students"
                        icon={Users}
                        title="Manage Students"
                        description="View and edit student records"
                      />
                    </>
                  )}
                  {user.role === "TEACHER" && (
                    <>
                      <QuickActionCard
                        href="/dashboard/my-schedule"
                        icon={Calendar}
                        title="My Schedule"
                        description="View your teaching schedule"
                      />
                      <QuickActionCard
                        href="/dashboard/my-classes"
                        icon={GraduationCap}
                        title="My Classes"
                        description="View assigned classes and students"
                      />
                    </>
                  )}
                  {user.role === "STUDENT" && (
                    <QuickActionCard
                      href="/dashboard/my-timetable"
                      icon={Calendar}
                      title="My Timetable"
                      description="View your class schedule"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.program}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {activity._count.students}
                          </p>
                          <p className="text-xs text-muted-foreground">students</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes yet</p>
                    <p className="text-sm">Add classes to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all group"
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-medium group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.a>
  );
}
