import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the Gemini model
export function getGeminiModel(): GenerativeModel {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Timetable optimization types
export interface TimetableConstraints {
  maxClassesPerDay: number;
  minBreakBetweenClasses: number;
  preferredStartTime: string;
  preferredEndTime: string;
  avoidBackToBackLabs: boolean;
}

export interface TimetableSlot {
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  roomName: string;
  className: string;
}

export interface OptimizationSuggestion {
  type: "conflict" | "improvement" | "warning";
  message: string;
  affectedSlots?: string[];
  suggestedAction?: string;
}

// Generate timetable optimization suggestions
export async function generateOptimizationSuggestions(
  currentTimetable: TimetableSlot[],
  constraints: TimetableConstraints
): Promise<OptimizationSuggestion[]> {
  const model = getGeminiModel();

  const prompt = `You are a timetable optimization expert for an educational institution. Analyze the following timetable and provide optimization suggestions.

CURRENT TIMETABLE:
${JSON.stringify(currentTimetable, null, 2)}

CONSTRAINTS:
- Maximum classes per day: ${constraints.maxClassesPerDay}
- Minimum break between classes: ${constraints.minBreakBetweenClasses} minutes
- Preferred start time: ${constraints.preferredStartTime}
- Preferred end time: ${constraints.preferredEndTime}
- Avoid back-to-back labs: ${constraints.avoidBackToBackLabs}

Please analyze the timetable and provide suggestions in the following JSON format:
[
  {
    "type": "conflict" | "improvement" | "warning",
    "message": "Description of the issue or suggestion",
    "affectedSlots": ["optional array of affected time slots"],
    "suggestedAction": "What action should be taken"
  }
]

Focus on:
1. Identifying scheduling conflicts (same teacher/room at same time)
2. Optimizing teacher workload distribution
3. Ensuring adequate breaks between classes
4. Balancing class load across the week
5. Avoiding problematic patterns (e.g., back-to-back labs)

Return ONLY the JSON array, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the JSON response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as OptimizationSuggestion[];
    }

    return [];
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Generate a new timetable suggestion
export async function generateTimetableSuggestion(
  subjects: { code: string; name: string; credits: number; type: string }[],
  teachers: { id: string; name: string; subjects: string[] }[],
  rooms: { id: string; name: string; type: string; capacity: number }[],
  classes: { id: string; name: string; strength: number }[],
  timeSlots: { day: string; period: number; startTime: string; endTime: string }[],
  constraints: TimetableConstraints
): Promise<TimetableSlot[]> {
  const model = getGeminiModel();

  const prompt = `You are a timetable scheduling expert. Generate an optimal timetable based on the following data.

SUBJECTS:
${JSON.stringify(subjects, null, 2)}

TEACHERS (with their teachable subjects):
${JSON.stringify(teachers, null, 2)}

ROOMS:
${JSON.stringify(rooms, null, 2)}

CLASSES:
${JSON.stringify(classes, null, 2)}

AVAILABLE TIME SLOTS:
${JSON.stringify(timeSlots, null, 2)}

CONSTRAINTS:
- Maximum classes per day per class: ${constraints.maxClassesPerDay}
- Minimum break between classes: ${constraints.minBreakBetweenClasses} minutes
- Preferred start time: ${constraints.preferredStartTime}
- Preferred end time: ${constraints.preferredEndTime}
- Avoid back-to-back labs: ${constraints.avoidBackToBackLabs}

Generate an optimal timetable in the following JSON format:
[
  {
    "day": "MONDAY",
    "period": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "subjectName": "Database Management",
    "subjectCode": "CS301",
    "teacherName": "Prof. Smith",
    "roomName": "C-101",
    "className": "BTech CS Year 3"
  }
]

RULES:
1. No teacher can be in two places at the same time
2. No room can host two classes at the same time
3. No class can have two subjects at the same time
4. Match room type to subject type (labs for practicals)
5. Ensure room capacity >= class strength
6. Distribute classes evenly across the week

Return ONLY the JSON array, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as TimetableSlot[];
    }

    return [];
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Chat with AI about timetable
export async function chatWithAI(
  message: string,
  context?: {
    timetable?: TimetableSlot[];
    subjects?: string[];
    teachers?: string[];
    rooms?: string[];
  }
): Promise<string> {
  const model = getGeminiModel();

  let contextStr = "";
  if (context) {
    if (context.timetable && context.timetable.length > 0) {
      contextStr += `\nCURRENT TIMETABLE:\n${JSON.stringify(context.timetable.slice(0, 20), null, 2)}`;
    }
    if (context.subjects && context.subjects.length > 0) {
      contextStr += `\nSUBJECTS: ${context.subjects.join(", ")}`;
    }
    if (context.teachers && context.teachers.length > 0) {
      contextStr += `\nTEACHERS: ${context.teachers.join(", ")}`;
    }
    if (context.rooms && context.rooms.length > 0) {
      contextStr += `\nROOMS: ${context.rooms.join(", ")}`;
    }
  }

  const prompt = `You are TimeMaster AI, an intelligent assistant for timetable management at SVKM NMIMS university. You help administrators, teachers, and students with scheduling-related queries.

${contextStr ? `CONTEXT:${contextStr}\n` : ""}

USER QUERY: ${message}

Provide a helpful, concise response. If the query is about scheduling conflicts, optimization, or timetable analysis, provide specific actionable suggestions. Be professional and direct.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}
