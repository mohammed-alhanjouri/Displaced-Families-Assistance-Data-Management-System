import { createClient } from "@supabase/supabase-js";

type UserRole =
  | "system_administrator"
  | "organization_manager"
  | "data_entry_staff";
type AccountStatus = "active" | "inactive";

interface ProfileCamp {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  username: string | null;
  user_role: UserRole;
  assigned_camp_id: string | null;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  assigned_camp?: ProfileCamp | ProfileCamp[] | null;
}

interface ValidatedUserInput {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  assignedCampId: string | null;
  status: AccountStatus;
}

interface CurrentAdmin {
  id: string;
  user_role: UserRole;
  status: AccountStatus;
}

interface AuthUserAttributes {
  email?: string;
  password?: string;
  email_confirm?: boolean;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

interface EdgeRuntime {
  env: {
    get(key: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): unknown;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-retry-count",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const roleValues: UserRole[] = [
  "system_administrator",
  "organization_manager",
  "data_entry_staff",
];
const statusValues: AccountStatus[] = ["active", "inactive"];
const usernamePattern = /^[a-z0-9_]{3,64}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const profileSelect =
  "id, full_name, email, username, user_role, assigned_camp_id, status, created_at, updated_at, assigned_camp:camps(id, name)";
const getEdgeRuntime = () => {
  const runtime = (globalThis as typeof globalThis & { Deno?: EdgeRuntime })
    .Deno;

  if (!runtime) {
    throw new Error("The admin-users function must run in the Supabase Edge Runtime.");
  }

  return runtime;
};
const edgeRuntime = getEdgeRuntime();
const serviceRoleKeyAliases = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "serviceRoleKey",
  "service_role_key",
  "serviceRole",
  "service_role",
  "default",
];

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const readEnv = (key: string) => readString(edgeRuntime.env.get(key));

const readSecretKeyFromJson = (secretKeysJson: string) => {
  try {
    const secretKeys = JSON.parse(secretKeysJson) as unknown;

    if (!isRecord(secretKeys)) {
      return "";
    }

    for (const alias of serviceRoleKeyAliases) {
      const key = readString(secretKeys[alias]);

      if (key) {
        return key;
      }
    }

    return Object.values(secretKeys).map(readString).find(Boolean) ?? "";
  } catch {
    return "";
  }
};

const getServiceRoleKey = () => {
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (serviceRoleKey) {
    return serviceRoleKey;
  }

  return readSecretKeyFromJson(readEnv("SUPABASE_SECRET_KEYS"));
};

const supabaseUrl = readEnv("SUPABASE_URL");
const serviceKey = getServiceRoleKey();

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase function environment variables.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new HttpError(401, "Sign in as a system administrator to continue.");
  }

  return match[1];
};

const readNullableString = (value: unknown) => {
  const text = readString(value);
  return text.length > 0 ? text : null;
};

const readAssignedCamp = (assignedCamp: ProfileRow["assigned_camp"]) =>
  Array.isArray(assignedCamp) ? assignedCamp[0] ?? null : assignedCamp ?? null;

const readRole = (value: unknown) => {
  const role = readString(value) as UserRole;
  return roleValues.includes(role) ? role : null;
};

const readStatus = (value: unknown) => {
  const status = readString(value) as AccountStatus;
  return statusValues.includes(status) ? status : null;
};

const normalizeProfile = (profile: ProfileRow) => {
  const assignedCamp = readAssignedCamp(profile.assigned_camp);

  return {
    id: profile.id,
    fullName: profile.full_name ?? "",
    email: profile.email,
    username: profile.username ?? "",
    role: profile.user_role,
    assignedCampId: profile.assigned_camp_id,
    assignedCampName: assignedCamp?.name ?? null,
    status: profile.status,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

const requireSystemAdministrator = async (req: Request) => {
  const token = getBearerToken(req);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    throw new HttpError(401, "Your session could not be verified.");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, user_role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new HttpError(500, profileError.message);
  }

  if (
    !profile ||
    profile.user_role !== "system_administrator" ||
    profile.status !== "active"
  ) {
    throw new HttpError(
      403,
      "Only active system administrators can manage users.",
    );
  }

  return profile as CurrentAdmin;
};

const validateUserPayload = (
  payload: unknown,
  options: { requirePassword: boolean },
) => {
  if (!isRecord(payload)) {
    throw new HttpError(400, "Missing user details.");
  }

  const fullName = readString(payload.fullName);
  const email = readString(payload.email).toLowerCase();
  const username = readString(payload.username).toLowerCase();
  const password = readString(payload.password);
  const role = readRole(payload.role);
  const status = readStatus(payload.status) ?? "active";
  const assignedCampId =
    role === "data_entry_staff"
      ? readNullableString(payload.assignedCampId)
      : null;

  if (fullName.length < 2 || fullName.length > 120) {
    throw new HttpError(400, "Full name must be between 2 and 120 characters.");
  }

  if (!emailPattern.test(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }

  if (!usernamePattern.test(username)) {
    throw new HttpError(
      400,
      "Username must be 3-64 characters using lowercase letters, numbers, or underscores.",
    );
  }

  if (!role) {
    throw new HttpError(400, "Select a valid role.");
  }

  if (role === "data_entry_staff" && !assignedCampId) {
    throw new HttpError(400, "Assign a camp for data entry staff.");
  }

  if (options.requirePassword && password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters.");
  }

  if (!options.requirePassword && password.length > 0 && password.length < 8) {
    throw new HttpError(400, "New password must be at least 8 characters.");
  }

  return {
    fullName,
    email,
    username,
    password,
    role,
    assignedCampId,
    status,
  } satisfies ValidatedUserInput;
};

const fetchProfileById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(profileSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, error.message);
  }

  if (!data) {
    throw new HttpError(404, "User profile was not found.");
  }

  return normalizeProfile(data as ProfileRow);
};

const listUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(profileSelect)
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) {
    throw new HttpError(500, error.message);
  }

  return { users: ((data ?? []) as ProfileRow[]).map(normalizeProfile) };
};

const rollbackCreatedUser = async (userId: string) => {
  await supabaseAdmin.from("profiles").delete().eq("id", userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);
};

const createUser = async (payload: unknown) => {
  const input = validateUserPayload(payload, { requirePassword: true });
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: {
      full_name: input.fullName,
      username: input.username,
    },
  });

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data.user) {
    throw new HttpError(500, "Supabase did not return the created user.");
  }

  const userId = data.user.id;
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      full_name: input.fullName,
      email: input.email,
      username: input.username,
      user_role: input.role,
      assigned_camp_id: input.assignedCampId,
      status: input.status,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await rollbackCreatedUser(userId);
    throw new HttpError(400, profileError.message);
  }

  return { user: await fetchProfileById(userId) };
};

const updateUser = async (
  payload: unknown,
  currentAdmin: CurrentAdmin,
) => {
  if (!isRecord(payload)) {
    throw new HttpError(400, "Missing user details.");
  }

  const id = readString(payload.id);
  const input = validateUserPayload(payload, { requirePassword: false });

  if (!id) {
    throw new HttpError(400, "Missing user id.");
  }

  if (id === currentAdmin.id && input.role !== "system_administrator") {
    throw new HttpError(400, "You cannot remove your own system admin role.");
  }

  if (id === currentAdmin.id && input.status !== "active") {
    throw new HttpError(400, "You cannot deactivate your own account.");
  }

  const { data: currentUser, error: currentUserError } =
    await supabaseAdmin.auth.admin.getUserById(id);

  if (currentUserError || !currentUser.user) {
    throw new HttpError(
      currentUserError ? 400 : 404,
      currentUserError?.message ?? "Auth user was not found.",
    );
  }

  const authUpdates: AuthUserAttributes = {
    email: input.email,
    email_confirm: true,
    app_metadata: {
      ...(currentUser.user.app_metadata ?? {}),
      role: input.role,
    },
    user_metadata: {
      ...(currentUser.user.user_metadata ?? {}),
      full_name: input.fullName,
      username: input.username,
    },
  };

  if (input.password) {
    authUpdates.password = input.password;
  }

  const { error: authUpdateError } =
    await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);

  if (authUpdateError) {
    throw new HttpError(400, authUpdateError.message);
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: input.fullName,
      email: input.email,
      username: input.username,
      user_role: input.role,
      assigned_camp_id: input.assignedCampId,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(profileSelect)
    .maybeSingle();

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data) {
    throw new HttpError(404, "User profile was not found.");
  }

  return { user: normalizeProfile(data as ProfileRow) };
};

const setUserStatus = async (
  payload: unknown,
  currentAdmin: CurrentAdmin,
) => {
  if (!isRecord(payload)) {
    throw new HttpError(400, "Missing status details.");
  }

  const id = readString(payload.id);
  const status = readStatus(payload.status);

  if (!id || !status) {
    throw new HttpError(400, "Select a valid user and status.");
  }

  if (id === currentAdmin.id && status === "inactive") {
    throw new HttpError(400, "You cannot deactivate your own account.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(profileSelect)
    .maybeSingle();

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data) {
    throw new HttpError(404, "User profile was not found.");
  }

  return { user: normalizeProfile(data as ProfileRow) };
};

edgeRuntime.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  try {
    const currentAdmin = await requireSystemAdministrator(req);
    const body = (await req.json().catch(() => ({}))) as unknown;

    if (!isRecord(body)) {
      throw new HttpError(400, "Invalid request body.");
    }

    const action = readString(body.action);
    const payload = body.payload;

    if (action === "list") {
      return jsonResponse(200, { data: await listUsers() });
    }

    if (action === "create") {
      return jsonResponse(200, { data: await createUser(payload) });
    }

    if (action === "update") {
      return jsonResponse(200, {
        data: await updateUser(payload, currentAdmin),
      });
    }

    if (action === "set_status") {
      return jsonResponse(200, {
        data: await setUserStatus(payload, currentAdmin),
      });
    }

    throw new HttpError(400, "Unsupported user management action.");
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unable to manage users.";

    return jsonResponse(status, { error: message });
  }
});
