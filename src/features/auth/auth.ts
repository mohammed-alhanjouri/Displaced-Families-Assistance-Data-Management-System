import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type UserRole =
  | "system_administrator"
  | "organization_manager"
  | "data_entry_staff";

// Define the structure of the user profile as stored in the database
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  user_role: UserRole;
  assigned_camp_id: string | null;
  status: "active" | "inactive";
  assigned_camp?: {
    name: string;
  } | null;
}

// Define the structure of the authenticated user object used in the app
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedCampId: string | null;
  assignedCampName: string | null;
}

// Define a mapping of role aliases to official user roles
const roleAliases: Record<string, UserRole> = {
  admin: "system_administrator",
  system_admin: "system_administrator",
  system_administrator: "system_administrator",
  manager: "organization_manager",
  org_manager: "organization_manager",
  organization_manager: "organization_manager",
  data_entry: "data_entry_staff",
  data_entry_staff: "data_entry_staff",
  staff: "data_entry_staff",
};

// Define a mapping of user roles to their display labels
const roleLabels: Record<UserRole, string> = {
  system_administrator: "System Admin",
  organization_manager: "Organization Manager",
  data_entry_staff: "Data Entry",
};

// Define a mapping of user roles to their home pages
const roleHomePaths: Record<UserRole, string> = {
  system_administrator: "/dashboard",
  organization_manager: "/dashboard",
  data_entry_staff: "/data-entry-dashboard",
};

export const normalizeUserRole = (role: unknown) => {
  if (typeof role !== "string") {
    return null;
  }

  return roleAliases[role.trim().toLowerCase()] ?? null;
};

export const getRoleLabel = (role: UserRole) => roleLabels[role];

export const getRoleHomePath = (role: UserRole) => roleHomePaths[role];

export const isDataEntryRole = (role: UserRole) => role === "data_entry_staff";

export const getUserRole = (user: User, profile: UserProfile | null) => {
  return (
    normalizeUserRole(profile?.user_role) ??
    normalizeUserRole(user.app_metadata.role) ??
    normalizeUserRole(user.app_metadata.user_role) ??
    normalizeUserRole(user.app_metadata.app_role)
  );
};

export const fetchCurrentProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, user_role, assigned_camp_id, status, assigned_camp:camps(name)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile | null;
};

// Build the AuthUser object by combining data from the Supabase User and the user profile stored in the database
export const buildAuthUser = async (user: User) => {
  const profile = await fetchCurrentProfile(user.id);
  const role = getUserRole(user, profile);

  // Check for role assignment and account status
  if (!role) {
    throw new Error("Your account does not have an assigned system role.");
  }

  if (profile?.status === "inactive") {
    throw new Error("Your account is inactive. Contact the system admin.");
  }

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? "",
    name: profile?.full_name ?? user.email ?? "User",
    role,
    assignedCampId: profile?.assigned_camp_id ?? null,
    assignedCampName: profile?.assigned_camp?.name ?? null
  } satisfies AuthUser;
};

export const getCurrentAuthUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return buildAuthUser(user);
};
