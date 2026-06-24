import { supabase } from "./supabase";
import type { FamilyRegistrationValues } from "../features/register-family/formTypes";

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
  current_camp: { name: string }[] | null;
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
  originalResidenceGovernorate: string;
  originalResidenceCity: string;
  createdAt: string;
  updatedAt: string;
};

// Select query for fetching family data
const familySelect =
  "id, national_id, family_head_name, phone_number, total_members, is_female_headed, female_head_reason, current_camp_id, original_residence_governorate, original_residence_city, created_at, updated_at, current_camp:camps(name)";

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
  currentCampName: row.current_camp?.[0]?.name ?? null,
  originalResidenceGovernorate: row.original_residence_governorate,
  originalResidenceCity: row.original_residence_city,
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

  return ((data ?? []) as FamilyRow[]).map(toFamilyRecord);
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

  return data ? toFamilyRecord(data as FamilyRow) : null;
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

  return toFamilyRecord(data as FamilyRow);
};

// Filter families based on a search string, matching against national ID, family head name, or phone number
export const filterFamilies = (families: FamilyRecord[], search: string) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return families;
  }

  return families.filter(
    (family) =>
      family.nationalId.includes(normalizedSearch) ||
      family.familyHeadName.toLowerCase().includes(normalizedSearch) ||
      family.phoneNumber.includes(normalizedSearch),
  );
};
