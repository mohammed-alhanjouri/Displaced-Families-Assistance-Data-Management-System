import { expect, type Locator, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type UserRole =
  | "system_administrator"
  | "organization_manager"
  | "data_entry_staff";

type E2EAccount = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  homePath: string;
  homeHeading: string;
};

export type SeededFamily = {
  id: string;
  nationalId: string;
  familyHeadName: string;
  phoneNumber: string;
  totalMembers: number;
  isFemaleHeaded: boolean;
  femaleHeadReason: string | null;
  campId: string;
  campName: string;
  originalResidenceGovernorate: string;
  originalResidenceCity: string;
};

type SeedFamilyOptions = Partial<
  Pick<
    SeededFamily,
    | "nationalId"
    | "familyHeadName"
    | "phoneNumber"
    | "totalMembers"
    | "isFemaleHeaded"
    | "campName"
    | "originalResidenceGovernorate"
    | "originalResidenceCity"
  >
> & {
  femaleHeadReason?: string;
};

type AssistanceSeed = {
  assistanceType: string;
  assistanceDate: string;
  providerOrganization: string;
  notes: string;
};

export const e2eCamps = {
  campA: "E2E Camp A",
  campB: "E2E Camp B",
} as const;

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required E2E environment variable: ${name}`);
  }

  return value;
};

const createE2EClient = () =>
  createClient(
    requiredEnv("VITE_SUPABASE_URL"),
    requiredEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

export const getE2EAccounts = () => ({
  admin: {
    username: requiredEnv("E2E_ADMIN_USERNAME"),
    email: requiredEnv("E2E_ADMIN_EMAIL"),
    password: requiredEnv("E2E_ADMIN_PASSWORD"),
    role: "system_administrator",
    homePath: "/dashboard",
    homeHeading: "System Administrator Dashboard",
  },
  manager: {
    username: requiredEnv("E2E_MANAGER_USERNAME"),
    email: requiredEnv("E2E_MANAGER_EMAIL"),
    password: requiredEnv("E2E_MANAGER_PASSWORD"),
    role: "organization_manager",
    homePath: "/dashboard",
    homeHeading: "Dashboard",
  },
  dataEntry: {
    username: requiredEnv("E2E_DATA_ENTRY_USERNAME"),
    email: requiredEnv("E2E_DATA_ENTRY_EMAIL"),
    password: requiredEnv("E2E_DATA_ENTRY_PASSWORD"),
    role: "data_entry_staff",
    homePath: "/data-entry-dashboard",
    homeHeading: "Dashboard",
  },
  inactive: {
    username: requiredEnv("E2E_INACTIVE_USERNAME"),
    email: requiredEnv("E2E_INACTIVE_EMAIL"),
    password: requiredEnv("E2E_INACTIVE_PASSWORD"),
    role: "organization_manager",
    homePath: "/login",
    homeHeading: "Sign in",
  },
} satisfies Record<string, E2EAccount>);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const retryDelaysMs = [500, 1_500, 3_000];
const loginAttemptCount = 3;
const loginDestinationTimeoutMs = 15_000;
const transientNetworkErrorPattern =
  /fetch failed|network|timeout|econnreset|etimedout|enotfound|eai_again|socket/i;

const readErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const hasSupabaseError = (
  result: unknown,
): result is { error: { message: string } } =>
  typeof result === "object" &&
  result !== null &&
  "error" in result &&
  typeof result.error === "object" &&
  result.error !== null &&
  "message" in result.error &&
  typeof result.error.message === "string";

const isTransientNetworkError = (message: string) =>
  transientNetworkErrorPattern.test(message);

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

const withTransientRetry = async <Result>(
  operationName: string,
  operation: () => PromiseLike<Result>,
) => {
  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const isFinalAttempt = attempt === retryDelaysMs.length;
      const isTransient = isTransientNetworkError(readErrorMessage(error));

      if (!isTransient || isFinalAttempt) {
        throw error;
      }

      await wait(retryDelaysMs[attempt]);
    }
  }

  throw new Error(`${operationName} failed without returning a result.`);
};

const withSupabaseRetry = <Result>(
  operationName: string,
  operation: () => PromiseLike<Result>,
) =>
  withTransientRetry(operationName, async () => {
    const result = await operation();

    if (
      hasSupabaseError(result) &&
      result.error &&
      isTransientNetworkError(result.error.message)
    ) {
      throw new Error(result.error.message);
    }

    return result;
  });

const resolveLoginEmail = async (
  client: SupabaseClient,
  loginIdentifier: string,
) => {
  if (loginIdentifier.includes("@")) {
    return loginIdentifier;
  }

  const { data, error } = await withSupabaseRetry(
    "Resolve login email",
    () =>
      client.rpc("resolve_login_email", {
        login_identifier: loginIdentifier,
      }),
  );

  if (error) {
    throw new Error(error.message);
  }

  if (typeof data !== "string" || !data.includes("@")) {
    throw new Error(`Unable to resolve E2E login identifier ${loginIdentifier}`);
  }

  return data;
};

const signInClient = async (account: E2EAccount) => {
  const client = createE2EClient();
  const email = await resolveLoginEmail(client, account.username);
  const { data, error } = await withSupabaseRetry("Sign in E2E user", () =>
    client.auth.signInWithPassword({
      email,
      password: account.password,
    }),
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error(`Supabase did not return a user for ${account.username}`);
  }

  return { client, userId: data.user.id };
};

export const todayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const makeUniqueSuffix = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const makeNationalId = () =>
  String(Math.floor(100_000_000 + Math.random() * 900_000_000));

export const makePhoneNumber = () =>
  `059${String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0")}`;

const getCamp = async (client: SupabaseClient, campName: string) => {
  const { data, error } = await withSupabaseRetry("Fetch E2E camp", () =>
    client.from("camps").select("id, name").eq("name", campName).single(),
  );

  if (error) {
    throw new Error(error.message);
  }

  return data as { id: string; name: string };
};

const setDataEntryCamp = async (
  client: SupabaseClient,
  userId: string,
  campId: string,
) => {
  const { error } = await withSupabaseRetry("Assign E2E data-entry camp", () =>
    client
      .from("profiles")
      .update({ assigned_camp_id: campId })
      .eq("id", userId),
  );

  if (error) {
    throw new Error(error.message);
  }
};

const calculateVulnerability = ({
  totalMembers,
  isFemaleHeaded,
  hasElderlyMember,
  hasDisability,
}: {
  totalMembers: number;
  isFemaleHeaded: boolean;
  hasElderlyMember: boolean;
  hasDisability: boolean;
}) => {
  const score =
    (hasElderlyMember ? 3 : 0) +
    (hasDisability ? 3 : 0) +
    (totalMembers > 6 ? 2 : 0) +
    (isFemaleHeaded ? 2 : 0);
  const level = score >= 7 ? "High" : score >= 4 ? "Medium" : "Low";

  return { score, level };
};

export const seedFamily = async (options: SeedFamilyOptions = {}) => {
  const accounts = getE2EAccounts();
  const { client, userId } = await signInClient(accounts.dataEntry);
  const campName = options.campName ?? e2eCamps.campA;
  const camp = await getCamp(client, campName);

  await setDataEntryCamp(client, userId, camp.id);

  const familyInput = {
    national_id: options.nationalId ?? makeNationalId(),
    family_head_name:
      options.familyHeadName ?? `E2E Family ${makeUniqueSuffix()}`,
    phone_number: options.phoneNumber ?? makePhoneNumber(),
    total_members: options.totalMembers ?? 7,
    is_female_headed: options.isFemaleHeaded ?? false,
    female_head_reason:
      options.isFemaleHeaded ?? false
        ? (options.femaleHeadReason ?? "E2E female-headed household")
        : null,
    current_camp_id: camp.id,
    original_residence_governorate:
      options.originalResidenceGovernorate ?? "Gaza",
    original_residence_city: options.originalResidenceCity ?? "Gaza City",
  };

  const { data: family, error } = await withSupabaseRetry(
    "Seed E2E family",
    () =>
      client
        .from("families")
        .insert(familyInput)
        .select(
          "id, national_id, family_head_name, phone_number, total_members, is_female_headed, female_head_reason, current_camp_id, original_residence_governorate, original_residence_city",
        )
        .single(),
  );

  if (error) {
    throw new Error(error.message);
  }

  const vulnerability = calculateVulnerability({
    totalMembers: Number(family.total_members),
    isFemaleHeaded: Boolean(family.is_female_headed),
    hasElderlyMember: false,
    hasDisability: false,
  });

  const { error: assessmentError } = await withSupabaseRetry(
    "Seed E2E vulnerability assessment",
    () =>
      client.from("vulnerability_assessments").insert({
        family_id: family.id,
        has_elderly_member: false,
        elderly_members_count: 0,
        has_disability: false,
        disabilities_count: 0,
        is_large_family: Number(family.total_members) > 6,
        is_female_headed: Boolean(family.is_female_headed),
        score: vulnerability.score,
        level: vulnerability.level,
      }),
  );

  if (assessmentError) {
    throw new Error(assessmentError.message);
  }

  return {
    id: String(family.id),
    nationalId: String(family.national_id),
    familyHeadName: String(family.family_head_name),
    phoneNumber: String(family.phone_number),
    totalMembers: Number(family.total_members),
    isFemaleHeaded: Boolean(family.is_female_headed),
    femaleHeadReason:
      typeof family.female_head_reason === "string"
        ? family.female_head_reason
        : null,
    campId: String(family.current_camp_id),
    campName: camp.name,
    originalResidenceGovernorate: String(
      family.original_residence_governorate,
    ),
    originalResidenceCity: String(family.original_residence_city),
  } satisfies SeededFamily;
};

export const seedAssistance = async (
  family: SeededFamily,
  options: Partial<AssistanceSeed> = {},
) => {
  const accounts = getE2EAccounts();
  const { client, userId } = await signInClient(accounts.dataEntry);

  await setDataEntryCamp(client, userId, family.campId);

  const assistance = {
    assistance_type: options.assistanceType ?? "Food",
    assistance_date: options.assistanceDate ?? todayInputValue(),
    provider_organization:
      options.providerOrganization ?? `E2E Provider ${makeUniqueSuffix()}`,
    notes: options.notes ?? "Seeded by Playwright E2E.",
  };

  const { data, error } = await withSupabaseRetry("Seed E2E assistance", () =>
    client
      .from("family_assistance")
      .insert({
        family_id: family.id,
        ...assistance,
      })
      .select("id")
      .single(),
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    assistanceType: assistance.assistance_type,
    assistanceDate: assistance.assistance_date,
    providerOrganization: assistance.provider_organization,
    notes: assistance.notes,
  };
};

export const fetchAdminUserByUsername = async (username: string) => {
  const accounts = getE2EAccounts();
  const { client } = await signInClient(accounts.admin);
  const { data, error } = await withSupabaseRetry("Fetch E2E admin users", () =>
    client.functions.invoke<{
      data?: {
        users: {
          id: string;
          fullName: string;
          email: string;
          username: string;
          role: UserRole;
          assignedCampName: string | null;
          status: "active" | "inactive";
        }[];
      };
      error?: string;
    }>("admin-users", {
      body: { action: "list" },
    }),
  );

  if (error) {
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data?.users.find((user) => user.username === username) ?? null;
};

export const loginAs = async (
  page: Page,
  account: E2EAccount,
  options: { campName?: string } = {},
) => {
  let lastLoginError: unknown;

  for (let attempt = 1; attempt <= loginAttemptCount; attempt += 1) {
    try {
      await page.goto("/login");
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });
      await page.reload();

      await page.getByLabel("Email / Username").fill(account.username);
      await page.locator("#password").fill(account.password);
      await page.getByRole("button", { name: /^Sign in$/ }).click();

      if (account.role === "data_entry_staff") {
        const campSelect = page.getByLabel("Working Location / Camp");

        await expect(campSelect).toBeVisible();
        await campSelect.selectOption({
          label: options.campName ?? e2eCamps.campA,
        });
        await page
          .getByRole("button", { name: "Continue as Data Entry Staff" })
          .click();
      }

      await expect(page).toHaveURL(
        new RegExp(`${escapeRegExp(account.homePath)}$`),
        { timeout: loginDestinationTimeoutMs },
      );
      await expect(
        page.getByRole("heading", { name: account.homeHeading }).first(),
      ).toBeVisible();

      return;
    } catch (error) {
      lastLoginError = error;

      if (attempt === loginAttemptCount) {
        break;
      }
    }
  }

  throw new Error(
    `Unable to log in as ${account.username} after ${loginAttemptCount} attempts. Last error: ${readErrorMessage(lastLoginError)}`,
  );
};

export const logout = async (page: Page) => {
  await page.goto("/logout");
  await expect(page).toHaveURL(/\/login$/);
};

export const fillFamilyRegistrationForm = async (
  page: Page,
  family: {
    nationalId: string;
    familyHeadName: string;
    phoneNumber: string;
    totalMembers: number;
    isFemaleHeaded?: boolean;
    femaleHeadReason?: string;
    campName?: string;
    originalResidenceGovernorate?: string;
    originalResidenceCity?: string;
  },
) => {
  await page.getByLabel(/National ID/).fill(family.nationalId);
  await page.getByLabel(/Family Head Name/).fill(family.familyHeadName);
  await page.getByLabel(/Phone Number/).fill(family.phoneNumber);
  await page.getByLabel(/Total Members/).fill(String(family.totalMembers));

  if (family.isFemaleHeaded) {
    await page.getByRole("checkbox", { name: "Female-Headed Household" }).check();
    await page
      .getByLabel("Female Head Reason")
      .fill(family.femaleHeadReason ?? "E2E female-headed household");
  }

  const campSelect = page.getByLabel(/Current Camp/);
  await expect(campSelect).toBeEnabled();
  await campSelect.selectOption({ label: family.campName ?? e2eCamps.campA });

  await page
    .getByLabel(/Original Residence Governorate/)
    .selectOption(family.originalResidenceGovernorate ?? "Gaza");
  await page
    .getByLabel(/Original Residence City/)
    .selectOption(family.originalResidenceCity ?? "Gaza City");
};

export const searchByNationalId = async (page: Page, nationalId: string) => {
  await page
    .getByLabel(/National ID \/ Family Head Name \/ Phone Number/)
    .fill(nationalId);
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("heading", { name: "Search Results" })).toBeVisible();
  await expect(page.getByRole("cell", { name: nationalId })).toBeVisible();
};

export const getFamilyInformationSection = (page: Page) =>
  page.locator("section").filter({
    has: page.getByRole("heading", { name: "Family Information" }),
  });

export const findPaginatedRowByText = async (page: Page, text: string) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const row = page.locator("tbody tr").filter({ hasText: text }).first();

    if ((await row.count()) > 0) {
      return row;
    }

    const nextButton = page.getByRole("button", { name: "Next" });

    if ((await nextButton.count()) === 0 || (await nextButton.isDisabled())) {
      break;
    }

    await nextButton.click();
  }

  throw new Error(`Unable to find row containing text: ${text}`);
};

export const expectStatValueLoaded = async (page: Page, title: string) => {
  const card = page
    .locator("section div")
    .filter({ has: page.getByRole("heading", { name: title }) })
    .first();
  const value = card.locator("p").first();

  await expect(value).not.toHaveText("...");
  await expect(value).toHaveText(/^\d+$/);
};

export const expectLocatorTextNumberAtLeast = async (
  locator: Locator,
  minimum: number,
) => {
  const text = (await locator.textContent())?.trim() ?? "";
  const value = Number(text);

  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(minimum);
};
