import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: UserRole;
}

/**
 * Get the current authenticated user from the database
 * Returns null if not authenticated or user not found in database
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // User exists in Clerk but not in our database yet
    // This can happen before the webhook syncs the user
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    return {
      id: "",
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      imageUrl: clerkUser.imageUrl || null,
      role: "STUDENT" as UserRole,
    };
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    role: user.role,
  };
}

/**
 * Get the current user's Clerk ID
 * Returns null if not authenticated
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}

/**
 * Check if the current user is a teacher
 */
export async function isTeacher(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "TEACHER" || user?.role === "ADMIN";
}
