import { supabase } from "./supabase";
import type { FamilyRegistrationValues } from "../features/register-family/formTypes";

// Type representing the vulnerability level of a family
export type VulnerabilityLevel = "Low" | "Medium" | "High";

// Type representing a related record in the database
type RelatedRecord<T> = T | T[] | null;

// Type representing the structure of a family row in the database
type FamilyRow = {
  id: string;
  national_id: string;
  family_head_name: string;
  phone_number: string;
  total_members: number;
  is_female_headed: boolean;
  female_head_reason: string | null;
  current_camp_id: string;
  original_residence_governorate: string;
  original_residence_city: string;
  created_at: string;
  updated_at: string;
  current_camp: RelatedRecord<{ name: string }>;
};

// Type representing the structure of a family record used in the application
export type FamilyRecord = {
  id: string;
  nationalId: string;
  familyHeadName: string;
  phoneNumber: string;
  totalMembers: number;
  isFemaleHeaded: boolean;
  femaleHeadReason: string | null;
  currentCampId: string;
  currentCampName: string | null;
  vulnerabilityLevel: VulnerabilityLevel;
  lastAssistanceDate: string | null;
  originalResidenceGovernorate: string;
  originalResidenceCity: string;
  createdAt: string;
  updatedAt: string;
};

// Type representing the partial structure of a last vulnerability assessment record for a family in the database
type FamilyVulnerabilityLevelRow = {
  family_id: string;
  level: VulnerabilityLevel;
  created_at: string;
};

// Type representing the partial structure of a last assistance record for a family in the database
type FamilyLastAssistanceRow = {
  family_id: string;
  assistance_date: string;
  created_at: string;
};

// Type representing the full structure of an assistance record in the database
type AssistanceRow = {
  id: string;
  family_id: string;
  assistance_type: string;
  assistance_date: string;
  provider_organization: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
  recorded_by_profile: RelatedRecord<{
    full_name: string | null;
    email: string | null;
  }>;
};

// Type representing the full structure of an assistance record used in the application
export type AssistanceRecord = {
  id: string;
  familyId: string;
  assistanceType: string;
  assistanceDate: string;
  providerOrganization: string;
  notes: string | null;
  recordedBy: string;
  recordedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

// Input type for creating a new assistance record
export type AssistanceFormValues = {
  familyId: string;
  assistanceType: string;
  assistanceDate: string;
  providerOrganization: string;
  notes: string;
};

// Type representing the full structure of a vulnerability assessment record in the database
type VulnerabilityAssessmentRow = {
  id: string;
  family_id: string;
  has_elderly_member: boolean;
  elderly_members_count: number;
  has_disability: boolean;
  disabilities_count: number;
  is_large_family: boolean;
  is_female_headed: boolean;
  score: number;
  level: VulnerabilityLevel;
  assessed_by: string;
  created_at: string;
  updated_at: string;
  assessed_by_profile: RelatedRecord<{
    full_name: string | null;
    email: string | null;
  }>;
};

// Type representing the full structure of a vulnerability assessment record used in the application
export type VulnerabilityAssessmentRecord = {
  id: string;
  familyId: string;
  hasElderlyMember: boolean;
  elderlyMembersCount: number;
  hasDisability: boolean;
  disabilitiesCount: number;
  isLargeFamily: boolean;
  isFemaleHeaded: boolean;
  score: number;
  level: VulnerabilityLevel;
  assessedBy: string;
  assessedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

// Input type for creating a new vulnerability assessment record
export type VulnerabilityAssessmentValues = {
  familyId: string;
  hasElderlyMember: boolean;
  elderlyMembersCount: number;
  hasDisability: boolean;
  disabilitiesCount: number;
  totalMembers: number;
  isFemaleHeaded: boolean;
};

// Type representing the dashboard statistics
export type DashboardStats = {
  totalFamilies: number;
  totalPersons: number;
  highVulnerabilityFamilies: number;
  assistanceProvidedCount: number;
};

// Type representing the filters for dashboard statistics
export type DashboardStatsFilters = {
  campId: string;
  fromDate: string;
  toDate: string;
};

// Type representing a row of family data for dashboard statistics
type DashboardStatsFamilyRow = {
  id: string;
  total_members: number;
  is_female_headed: boolean;
};

// Select query for fetching family data
const familySelect =
  "id, national_id, family_head_name, phone_number, total_members, is_female_headed, female_head_reason, current_camp_id, original_residence_governorate, original_residence_city, created_at, updated_at, current_camp:camps(name)";

const assistanceSelect =
  "id, family_id, assistance_type, assistance_date, provider_organization, notes, recorded_by, created_at, updated_at, recorded_by_profile:profiles!family_assistance_recorded_by_fkey(full_name, email)";

const vulnerabilityAssessmentSelect =
  "id, family_id, has_elderly_member, elderly_members_count, has_disability, disabilities_count, is_large_family, is_female_headed, score, level, assessed_by, created_at, updated_at, assessed_by_profile:profiles!vulnerability_assessments_assessed_by_fkey(full_name, email)";

const getRelatedRecord = <T>(record: RelatedRecord<T>) =>
  Array.isArray(record) ? (record[0] ?? null) : record;

const getProfileDisplayName = (
  profile: RelatedRecord<{ full_name: string | null; email: string | null }>,
) => {
  const relatedProfile = getRelatedRecord(profile);

  return relatedProfile?.full_name ?? relatedProfile?.email ?? null;
};

const getDateTimeStart = (date: string) => `${date}T00:00:00`;

const getNextDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return nextDate.toISOString().slice(0, 10);
};

// Calculate the vulnerability score and level based on family characteristics
export const calculateVulnerability = ({
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
  const level: VulnerabilityLevel =
    score >= 7 ? "High" : score >= 4 ? "Medium" : "Low";

  return { score, level };
};

// Calculate the initial vulnerability level for a family based on main characteristics
export const calculateInitialVulnerability = ({
  totalMembers,
  isFemaleHeaded,
}: {
  totalMembers: number;
  isFemaleHeaded: boolean;
}) =>
  calculateVulnerability({
    totalMembers,
    isFemaleHeaded,
    hasElderlyMember: false,
    hasDisability: false,
  });

// Convert a FamilyRow from the database into a FamilyRecord used in the application
const toFamilyRecord = (row: FamilyRow): FamilyRecord => ({
  id: row.id,
  nationalId: row.national_id,
  familyHeadName: row.family_head_name,
  phoneNumber: row.phone_number,
  totalMembers: row.total_members,
  isFemaleHeaded: row.is_female_headed,
  femaleHeadReason: row.female_head_reason,
  currentCampId: row.current_camp_id,
  currentCampName: getRelatedRecord(row.current_camp)?.name ?? null,
  vulnerabilityLevel: calculateInitialVulnerability({
    totalMembers: row.total_members,
    isFemaleHeaded: row.is_female_headed,
  }).level,
  lastAssistanceDate: null,
  originalResidenceGovernorate: row.original_residence_governorate,
  originalResidenceCity: row.original_residence_city,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fetchLatestVulnerabilityLevels = async (familyIds: string[]) => {
  if (familyIds.length === 0) {
    return new Map<string, VulnerabilityLevel>();
  }

  const { data, error } = await supabase
    .from("vulnerability_assessments")
    .select("family_id, level, created_at")
    .in("family_id", familyIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const latestLevelByFamily = new Map<string, VulnerabilityLevel>();

  for (const assessment of (data ?? []) as FamilyVulnerabilityLevelRow[]) {
    if (!latestLevelByFamily.has(assessment.family_id)) {
      latestLevelByFamily.set(assessment.family_id, assessment.level);
    }
  }

  return latestLevelByFamily;
};

const withVulnerabilityLevels = async (families: FamilyRecord[]) => {
  const latestLevelByFamily = await fetchLatestVulnerabilityLevels(
    families.map((family) => family.id),
  );

  return families.map((family) => ({
    ...family,
    vulnerabilityLevel:
      latestLevelByFamily.get(family.id) ?? family.vulnerabilityLevel,
  }));
};

// Fetch the latest assistance dates for a list of family IDs, returning a map of family ID to the latest assistance date
const fetchLatestAssistanceDates = async (familyIds: string[]) => {
  if (familyIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("family_assistance")
    .select("family_id, assistance_date, created_at")
    .in("family_id", familyIds)
    .order("assistance_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const latestAssistanceDateByFamily = new Map<string, string>();

  for (const assistance of (data ?? []) as FamilyLastAssistanceRow[]) {
    if (!latestAssistanceDateByFamily.has(assistance.family_id)) {
      latestAssistanceDateByFamily.set(
        assistance.family_id,
        assistance.assistance_date,
      );
    }
  }

  return latestAssistanceDateByFamily;
};

const withFamilySummaries = async (families: FamilyRecord[]) => {
  const [familiesWithVulnerabilityLevels, latestAssistanceDateByFamily] =
    await Promise.all([
      withVulnerabilityLevels(families),
      fetchLatestAssistanceDates(families.map((family) => family.id)),
    ]);

  return familiesWithVulnerabilityLevels.map((family) => ({
    ...family,
    lastAssistanceDate: latestAssistanceDateByFamily.get(family.id) ?? null,
  }));
};

const toAssistanceRecord = (row: AssistanceRow): AssistanceRecord => ({
  id: row.id,
  familyId: row.family_id,
  assistanceType: row.assistance_type,
  assistanceDate: row.assistance_date,
  providerOrganization: row.provider_organization,
  notes: row.notes,
  recordedBy: row.recorded_by,
  recordedByName: getProfileDisplayName(row.recorded_by_profile),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toVulnerabilityAssessmentRecord = (
  row: VulnerabilityAssessmentRow,
): VulnerabilityAssessmentRecord => ({
  id: row.id,
  familyId: row.family_id,
  hasElderlyMember: row.has_elderly_member,
  elderlyMembersCount: row.elderly_members_count,
  hasDisability: row.has_disability,
  disabilitiesCount: row.disabilities_count,
  isLargeFamily: row.is_large_family,
  isFemaleHeaded: row.is_female_headed,
  score: row.score,
  level: row.level,
  assessedBy: row.assessed_by,
  assessedByName: getProfileDisplayName(row.assessed_by_profile),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Fetch families from the database, optionally filtered by camp ID
export const fetchFamilies = async (campId?: string) => {
  let query = supabase
    .from("families")
    .select(familySelect)
    .order("updated_at", { ascending: false });

  if (campId) {
    query = query.eq("current_camp_id", campId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const families = ((data ?? []) as FamilyRow[]).map(toFamilyRecord);

  return withFamilySummaries(families);
};

// Fetch family count for a specific camp, returning 0 if no families are found
export const fetchFamilyCountByCamp = async (campId: string) => {
  const { count, error } = await supabase
    .from("families")
    .select("id", { count: "exact", head: true })
    .eq("current_camp_id", campId);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

// Fetch a single family by its national ID
export const fetchFamilyByNationalId = async (nationalId: string) => {
  const { data, error } = await supabase
    .from("families")
    .select(familySelect)
    .eq("national_id", nationalId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const [family] = await withVulnerabilityLevels([
    toFamilyRecord(data as FamilyRow),
  ]);

  return family ?? null;
};

// Update a family's information in the database based on their existing national ID
export const updateFamilyByNationalId = async (
  existingNationalId: string,
  values: FamilyRegistrationValues,
) => {
  const { data, error } = await supabase
    .from("families")
    .update({
      national_id: values.nationalID,
      family_head_name: values.familyHeadName.trim(),
      phone_number: values.phoneNumber,
      total_members: Number(values.totalMembers),
      is_female_headed: values.isFemaleHeaded,
      female_head_reason: values.isFemaleHeaded
        ? values.femaleHeadReason.trim()
        : null,
      current_camp_id: values.currentCampId,
      original_residence_governorate: values.originalResidenceGovernorate,
      original_residence_city: values.originalResidenceCity,
    })
    .eq("national_id", existingNationalId)
    .select(familySelect)
    .single();

  if (error) {
    throw error;
  }

  const [family] = await withVulnerabilityLevels([
    toFamilyRecord(data as FamilyRow),
  ]);

  return family;
};

export const fetchDashboardStats = async (
  filters: DashboardStatsFilters = {
    campId: "",
    fromDate: "",
    toDate: "",
  },
): Promise<DashboardStats> => {
  let familiesQuery = supabase
    .from("families")
    .select("id, total_members, is_female_headed");

  if (filters.campId) {
    familiesQuery = familiesQuery.eq("current_camp_id", filters.campId);
  }

  if (filters.fromDate) {
    familiesQuery = familiesQuery.gte(
      "updated_at",
      getDateTimeStart(filters.fromDate),
    );
  }

  if (filters.toDate) {
    familiesQuery = familiesQuery.lt(
      "updated_at",
      getDateTimeStart(getNextDate(filters.toDate)),
    );
  }

  const { data: families, error: familiesError } = await familiesQuery;

  if (familiesError) {
    throw familiesError;
  }

  let scopedFamilyIds: string[] | null = null;

  if (filters.campId) {
    const { data: campFamilies, error: campFamiliesError } = await supabase
      .from("families")
      .select("id")
      .eq("current_camp_id", filters.campId);

    if (campFamiliesError) {
      throw campFamiliesError;
    }

    scopedFamilyIds = (campFamilies ?? []).map((family) => family.id);
  }

  let assistanceCount = 0;

  if (!scopedFamilyIds || scopedFamilyIds.length > 0) {
    let assistanceQuery = supabase
      .from("family_assistance")
      .select("id", { count: "exact", head: true });

    if (scopedFamilyIds) {
      assistanceQuery = assistanceQuery.in("family_id", scopedFamilyIds);
    }

    if (filters.fromDate) {
      assistanceQuery = assistanceQuery.gte("assistance_date", filters.fromDate);
    }

    if (filters.toDate) {
      assistanceQuery = assistanceQuery.lte("assistance_date", filters.toDate);
    }

    const { count, error: assistanceError } = await assistanceQuery;

    if (assistanceError) {
      throw assistanceError;
    }

    assistanceCount = count ?? 0;
  }

  let assessments: FamilyVulnerabilityLevelRow[] = [];

  if (!scopedFamilyIds || scopedFamilyIds.length > 0) {
    let assessmentsQuery = supabase
      .from("vulnerability_assessments")
      .select("family_id, level, created_at")
      .order("created_at", { ascending: false });

    if (scopedFamilyIds) {
      assessmentsQuery = assessmentsQuery.in("family_id", scopedFamilyIds);
    }

    if (filters.fromDate) {
      assessmentsQuery = assessmentsQuery.gte(
        "created_at",
        getDateTimeStart(filters.fromDate),
      );
    }

    if (filters.toDate) {
      assessmentsQuery = assessmentsQuery.lt(
        "created_at",
        getDateTimeStart(getNextDate(filters.toDate)),
      );
    }

    const { data, error: assessmentsError } = await assessmentsQuery;

    if (assessmentsError) {
      throw assessmentsError;
    }

    assessments = (data ?? []) as FamilyVulnerabilityLevelRow[];
  }

  const latestAssessmentByFamily = new Map<string, VulnerabilityLevel>();

  for (const assessment of assessments) {
    if (!latestAssessmentByFamily.has(assessment.family_id)) {
      latestAssessmentByFamily.set(assessment.family_id, assessment.level);
    }
  }

  return {
    totalFamilies: families?.length ?? 0,
    totalPersons: (families ?? []).reduce(
      (sum, family) => sum + Number(family.total_members ?? 0),
      0,
    ),
    highVulnerabilityFamilies: (
      ((families ?? []) as DashboardStatsFamilyRow[])
    ).filter((family) => {
      const level =
        latestAssessmentByFamily.get(family.id) ??
        calculateInitialVulnerability({
          totalMembers: Number(family.total_members ?? 0),
          isFemaleHeaded: Boolean(family.is_female_headed),
        }).level;

      return level === "High";
    }).length,
    assistanceProvidedCount: assistanceCount ?? 0,
  };
};

export const fetchAssistanceRecords = async (familyId: string) => {
  const { data, error } = await supabase
    .from("family_assistance")
    .select(assistanceSelect)
    .eq("family_id", familyId)
    .order("assistance_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as AssistanceRow[]).map(toAssistanceRecord);
};

export const createAssistanceRecord = async ({
  familyId,
  assistanceType,
  assistanceDate,
  providerOrganization,
  notes,
}: AssistanceFormValues) => {
  const { data, error } = await supabase
    .from("family_assistance")
    .insert({
      family_id: familyId,
      assistance_type: assistanceType.trim(),
      assistance_date: assistanceDate,
      provider_organization: providerOrganization.trim(),
      notes: notes.trim() || null,
    })
    .select(assistanceSelect)
    .single();

  if (error) {
    throw error;
  }

  return toAssistanceRecord(data as AssistanceRow);
};

export const fetchLatestVulnerabilityAssessment = async (familyId: string) => {
  const { data, error } = await supabase
    .from("vulnerability_assessments")
    .select(vulnerabilityAssessmentSelect)
    .eq("family_id", familyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? toVulnerabilityAssessmentRecord(data as VulnerabilityAssessmentRow)
    : null;
};

export const createVulnerabilityAssessment = async ({
  familyId,
  hasElderlyMember,
  elderlyMembersCount,
  hasDisability,
  disabilitiesCount,
  totalMembers,
  isFemaleHeaded,
}: VulnerabilityAssessmentValues) => {
  const { score, level } = calculateVulnerability({
    totalMembers,
    isFemaleHeaded,
    hasElderlyMember,
    hasDisability,
  });

  const { data, error } = await supabase
    .from("vulnerability_assessments")
    .insert({
      family_id: familyId,
      has_elderly_member: hasElderlyMember,
      elderly_members_count: hasElderlyMember ? elderlyMembersCount : 0,
      has_disability: hasDisability,
      disabilities_count: hasDisability ? disabilitiesCount : 0,
      is_large_family: totalMembers > 6,
      is_female_headed: isFemaleHeaded,
      score,
      level,
    })
    .select(vulnerabilityAssessmentSelect)
    .single();

  if (error) {
    throw error;
  }

  return toVulnerabilityAssessmentRecord(data as VulnerabilityAssessmentRow);
};

// Filter families based on a search string, matching against national ID, family head name, or phone number
export const filterFamilies = (
  families: FamilyRecord[],
  search: string,
  vulnerabilityLevel: VulnerabilityLevel | "" = "",
) => {
  const normalizedSearch = search.trim().toLowerCase();

  return families.filter((family) => {
    const matchesSearch =
      !normalizedSearch ||
      family.nationalId.includes(normalizedSearch) ||
      family.familyHeadName.toLowerCase().includes(normalizedSearch) ||
      family.phoneNumber.includes(normalizedSearch);

    const matchesVulnerabilityLevel =
      vulnerabilityLevel === "" ||
      family.vulnerabilityLevel === vulnerabilityLevel;

    return matchesSearch && matchesVulnerabilityLevel;
  });
};
