"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Intelligent timetable generation with conflict detection",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Separate portals for admins, teachers, and students",
  },
  {
    icon: Building2,
    title: "Resource Management",
    description: "Manage rooms, labs, and facilities efficiently",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Instant notifications for schedule changes",
  },
];

const benefits = [
  "Automatic conflict detection",
  "Teacher availability tracking",
  "Room capacity management",
  "Multiple view formats",
  "Export to PDF/Excel",
  "Mobile responsive design",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12"
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center"
          >
            <Clock className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span className="text-xl font-bold gradient-text">TimeMaster</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 glow-purple-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 lg:px-12 lg:pt-32">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">SVKM NMIMS</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Master Your</span>
              <br />
              <span className="gradient-text">Timetable</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A powerful timetable management system designed for educational
              institutions. Schedule classes, manage resources, and keep everyone
              informed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium glow-purple"
                >
                  Start Scheduling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-border hover:bg-accent"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-2xl">
              <div className="rounded-lg bg-secondary/30 p-6 min-h-[400px] flex items-center justify-center">
                <div className="grid grid-cols-6 gap-2 w-full max-w-4xl">
                  {/* Simulated timetable grid */}
                  <div className="col-span-1" />
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + Math.random() * 0.3 }}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </motion.div>
                  ))}
                  {[1, 2, 3, 4, 5].map((period) => (
                    <>
                      <motion.div
                        key={`time-${period}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + period * 0.1 }}
                        className="text-sm text-muted-foreground py-4 text-right pr-3"
                      >
                        {8 + period}:00
                      </motion.div>
                      {[1, 2, 3, 4, 5].map((day) => (
                        <motion.div
                          key={`${period}-${day}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + (period * 5 + day) * 0.03 }}
                          className={`rounded-lg p-3 ${
                            Math.random() > 0.3
                              ? "bg-primary/20 border border-primary/30"
                              : "bg-secondary/50"
                          }`}
                        >
                          {Math.random() > 0.3 && (
                            <div className="text-xs text-primary font-medium">
                              {["DBMS", "CN", "DSA", "WP", "MM"][Math.floor(Math.random() * 5)]}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 lg:px-12 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive tools to manage your institution&apos;s schedule
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for{" "}
                <span className="gradient-text">Modern Institutions</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                TimeMaster combines powerful scheduling algorithms with an
                intuitive interface to make timetable management effortless.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                  {[
                    { label: "Classes Scheduled", value: "2,450+" },
                    { label: "Teachers Managed", value: "120+" },
                    { label: "Conflicts Prevented", value: "850+" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="text-2xl font-bold gradient-text">
                        {stat.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="rounded-2xl bg-gradient-to-b from-primary/20 to-card border border-primary/20 p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join SVKM NMIMS in managing timetables efficiently with TimeMaster.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 bg-primary hover:bg-primary/90 glow-purple"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 lg:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold">TimeMaster</span>
          </div>
          <p className="text-sm text-muted-foreground">
            SVKM NMIMS Timetable Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
