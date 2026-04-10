import "server-only";

import { redirect } from "next/navigation";
import { getServerCurrentUser } from "@/lib/server-api";
import { ApiRequestError } from "@/lib/api-error";
import { AuthenticatedUser, UserRole } from "@/lib/types";

export async function getOptionalAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    return await getServerCurrentUser();
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const currentUser = await getOptionalAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function requireAnyRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const currentUser = await requireAuthenticatedUser();
  const hasAllowedRole = currentUser.roles.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    redirect("/forbidden");
  }

  return currentUser;
}

export function canManageTemplates(currentUser: AuthenticatedUser): boolean {
  return currentUser.roles.includes("ADMIN") || currentUser.roles.includes("CLINICIAN");
}

export function canAccessScoring(currentUser: AuthenticatedUser): boolean {
  return currentUser.roles.includes("ADMIN") || currentUser.roles.includes("CLINICIAN");
}
