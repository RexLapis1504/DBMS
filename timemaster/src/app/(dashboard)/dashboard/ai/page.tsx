"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot, Zap, Brain } from "lucide-react";
import { AIChat } from "@/components/ai/ai-chat";
import { OptimizationPanel } from "@/components/ai/optimization-panel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function AIPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Powered by Google Gemini
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-3"
      >
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <Bot className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-medium mb-1">Chat Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Ask questions about scheduling, get help with timetable management
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <Zap className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-medium mb-1">Optimization</h3>
          <p className="text-sm text-muted-foreground">
            AI analyzes your timetable and suggests improvements
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <Brain className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-medium mb-1">Auto-Generate</h3>
          <p className="text-sm text-muted-foreground">
            Generate conflict-free timetables based on your constraints
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat */}
        <motion.div variants={itemVariants}>
          <AIChat includeContext={true} />
        </motion.div>

        {/* Optimization */}
        <motion.div variants={itemVariants}>
          <OptimizationPanel />
        </motion.div>
      </div>

      {/* Info */}
      <motion.div
        variants={itemVariants}
        className="rounded-lg border border-border bg-secondary/30 p-4"
      >
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          About TimeMaster AI
        </h4>
        <p className="text-sm text-muted-foreground">
          TimeMaster AI uses Google&apos;s Gemini model to help you manage timetables
          more efficiently. It can analyze scheduling conflicts, suggest
          optimizations, and even generate new timetables based on your
          constraints. Note that AI suggestions should be reviewed before
          implementation.
        </p>
      </motion.div>
    </motion.div>
  );
}
