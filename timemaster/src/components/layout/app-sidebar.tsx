"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  LayoutDashboard,
  Settings,
  LogOut,
  Clock,
  UserCog,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { title: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
  { title: "Rooms", href: "/dashboard/rooms", icon: Building2 },
  { title: "Teachers", href: "/dashboard/teachers", icon: UserCog },
  { title: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
  { title: "Classes", href: "/dashboard/classes", icon: GraduationCap },
  { title: "Students", href: "/dashboard/students", icon: Users },
  { title: "Time Slots", href: "/dashboard/timeslots", icon: Clock },
];

const teacherNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Schedule", href: "/dashboard/my-schedule", icon: Calendar },
  { title: "My Classes", href: "/dashboard/my-classes", icon: GraduationCap },
];

const studentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Timetable", href: "/dashboard/my-timetable", icon: Calendar },
];

interface AppSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { signOut } = useClerk();

  const getNavItems = () => {
    switch (user.role) {
      case "ADMIN":
        return adminNavItems;
      case "TEACHER":
        return teacherNavItems;
      case "STUDENT":
        return studentNavItems;
      default:
        return studentNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
          >
            <Clock className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          {state !== "collapsed" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold gradient-text">TimeMaster</h1>
              <p className="text-xs text-muted-foreground">SVKM NMIMS</p>
            </motion.div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {pathname === item.href && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-2 h-2 w-2 rounded-full bg-primary"
                            transition={{ type: "spring", duration: 0.3 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link href="/dashboard/settings">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {state !== "collapsed" && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role?.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <Users className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
