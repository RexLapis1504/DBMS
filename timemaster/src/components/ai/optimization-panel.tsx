"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface OptimizationSuggestion {
  type: "conflict" | "improvement" | "warning";
  message: string;
  affectedSlots?: string[];
  suggestedAction?: string;
}

interface OptimizationPanelProps {
  className?: string;
  classId?: string;
}

export function OptimizationPanel({ className, classId }: OptimizationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Constraints state
  const [constraints, setConstraints] = useState({
    maxClassesPerDay: 6,
    minBreakBetweenClasses: 10,
    preferredStartTime: "09:00",
    preferredEndTime: "17:00",
    avoidBackToBackLabs: true,
  });

  const runOptimization = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          constraints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run optimization");
      }

      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "improvement":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSuggestionBg = (type: string) => {
    switch (type) {
      case "conflict":
        return "border-destructive/30 bg-destructive/5";
      case "improvement":
        return "border-green-500/30 bg-green-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      default:
        return "border-border bg-secondary/30";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Timetable Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Constraints */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxClasses">Max Classes/Day</Label>
            <Input
              id="maxClasses"
              type="number"
              min={1}
              max={10}
              value={constraints.maxClassesPerDay}
              onChange={(e) =>
                setConstraints((c) => ({
                  ...c,
                  maxClassesPerDay: parseInt(e.target.value) || 6,
                }))
              }
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minBreak">Min Break (minutes)</Label>
            <Input
              id="minBreak"
              type="number"
              min={0}
              max={60}
              value={constraints.minBreakBetweenClasses}
              onChange={(e) =>
                setConstraints((c) => ({
                  ...c,
                  minBreakBetweenClasses: parseInt(e.target.value) || 10,
                }))
              }
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Preferred Start</Label>
            <Input
              id="startTime"
              type="time"
              value={constraints.preferredStartTime}
              onChange={(e) =>
                setConstraints((c) => ({
                  ...c,
                  preferredStartTime: e.target.value,
                }))
              }
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Preferred End</Label>
            <Input
              id="endTime"
              type="time"
              value={constraints.preferredEndTime}
              onChange={(e) =>
                setConstraints((c) => ({
                  ...c,
                  preferredEndTime: e.target.value,
                }))
              }
              className="bg-secondary/50"
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="avoidLabs" className="cursor-pointer">
              Avoid back-to-back labs
            </Label>
            <Switch
              id="avoidLabs"
              checked={constraints.avoidBackToBackLabs}
              onCheckedChange={(checked) =>
                setConstraints((c) => ({ ...c, avoidBackToBackLabs: checked }))
              }
            />
          </div>
        </div>

        {/* Run Button */}
        <Button
          onClick={runOptimization}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Timetable...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Optimization Analysis
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Suggestions */}
        <AnimatePresence mode="wait">
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-muted-foreground">
                Suggestions ({suggestions.length})
              </h4>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    getSuggestionBg(suggestion.type)
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getSuggestionIcon(suggestion.type)}
                    <p className="text-sm flex-1">{suggestion.message}</p>
                  </div>
                  {suggestion.suggestedAction && (
                    <p className="text-xs text-muted-foreground pl-6">
                      <span className="font-medium">Suggested action:</span>{" "}
                      {suggestion.suggestedAction}
                    </p>
                  )}
                  {suggestion.affectedSlots && suggestion.affectedSlots.length > 0 && (
                    <div className="pl-6 flex flex-wrap gap-1">
                      {suggestion.affectedSlots.map((slot, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-secondary"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && suggestions.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Click &quot;Run Optimization Analysis&quot; to get AI-powered suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
