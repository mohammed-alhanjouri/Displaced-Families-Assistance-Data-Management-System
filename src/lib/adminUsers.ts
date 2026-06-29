import type { UserRole } from "../features/auth/auth";
import { supabase } from "./supabase";

export type AccountStatus = "active" | "inactive";

// Define the structure of an admin user account, each field maps to a corresponding column in the database
export interface AdminUserAccount {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  assignedCampId: string | null;
  assignedCampName: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

// Define the structure of the payload used for creating or updating an admin user account, excluding fields that are automatically generated or managed by the system
export interface AdminUserFormPayload {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  assignedCampId: string | null;
  status: AccountStatus;
}

// Define the only allowed Edge Function actions for the admin user
type AdminUsersAction = "list" | "create" | "update" | "set_status";

// Define the generic Edge Function response structure for admin user operations, which can either contain the expected data or an error message
interface AdminUsersFunctionResponse<T> {
  data?: T;
  error?: string;
}

// Define the available user roles and their corresponding labels for display purposes
export const adminUserRoleOptions: { value: UserRole; label: string }[] = [
  { value: "system_administrator", label: "System Administrator" },
  { value: "data_entry_staff", label: "Data Entry Staff" },
  { value: "organization_manager", label: "Organization Manager" },
];

// Create a mapping of user roles to their display labels for easy lookup
export const adminUserRoleLabels = adminUserRoleOptions.reduce<
  Record<UserRole, string>
>((labels, role) => {
  labels[role.value] = role.label;
  return labels;
}, {} as Record<UserRole, string>);

export const getAdminUserRoleLabel = (role: UserRole) =>
  adminUserRoleLabels[role];

export const createEmptyAdminUserRoleCounts = () =>
  adminUserRoleOptions.reduce<Record<UserRole, number>>(
    (counts, role) => {
      counts[role.value] = 0;
      return counts;
    },
    {} as Record<UserRole, number>,
  );

export const sortAdminUsersByName = (users: AdminUserAccount[]) =>
  [...users].sort((first, second) =>
    first.fullName.localeCompare(second.fullName, undefined, {
      sensitivity: "base",
    }),
  );

// Define a utility function to extract readable error messages from Supabase Edge Function errors
const readFunctionErrorMessage = async (error: unknown) => {
  const context = (error as { context?: unknown })?.context;

  // If the error context is a Response object, clone and parse JSON
  if (context instanceof Response) {
    const body = await context
      .clone()
      .json()
      .catch(() => null);

    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  }

  // Fallback to returning the standard error message or a generic message
  return error instanceof Error ? error.message : "Unable to complete request.";
};

// Define a generic function to invoke the Supabase Edge Function for admin user operations, handling both the request and response, including error handling
const invokeAdminUsers = async <T>(
  action: AdminUsersAction,
  payload?: unknown,
) => {
  const { data, error } = await supabase.functions.invoke<
    AdminUsersFunctionResponse<T>
  >("admin-users", {
    body: { action, payload },
  });

  if (error) {
    throw new Error(await readFunctionErrorMessage(error));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data || !("data" in data)) {
    throw new Error("The admin user service returned an empty response.");
  }

  return data.data as T;
};

// Invoke "list" action to fetch all admin users from the Supabase Edge Function, returning an array of AdminUserAccount objects
export const fetchAdminUsers = async () => {
  const response = await invokeAdminUsers<{ users: AdminUserAccount[] }>("list");
  return response.users;
};

// Invoke "create" action to create a new admin user account with the provided payload, returning the created AdminUserAccount object
export const createAdminUser = async (payload: AdminUserFormPayload) => {
  const response = await invokeAdminUsers<{ user: AdminUserAccount }>(
    "create",
    payload,
  );
  return response.user;
};

// Invoke "update" action to update an existing admin user account identified by the provided ID with the new payload, returning the updated AdminUserAccount object
export const updateAdminUser = async (
  id: string,
  payload: AdminUserFormPayload,
) => {
  const response = await invokeAdminUsers<{ user: AdminUserAccount }>(
    "update",
    { id, ...payload },
  );
  return response.user;
};

// Invoke "set_status" action to update the status of an existing admin user account identified by the provided ID, returning the updated AdminUserAccount object
export const updateAdminUserStatus = async (
  id: string,
  status: AccountStatus,
) => {
  const response = await invokeAdminUsers<{ user: AdminUserAccount }>(
    "set_status",
    { id, status },
  );
  return response.user;
};
