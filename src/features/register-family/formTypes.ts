// Define family registration form values types
export interface FamilyRegistrationValues {
  nationalID: string;
  familyHeadName: string;
  phoneNumber: string;
  totalMembers: string;
  isFemaleHeaded: boolean;
  femaleHeadReason: string;
  currentCampId: string;
  originalResidenceGovernorate: string;
  originalResidenceCity: string;
}

// Define family registration form errors types
export type FamilyRegistrationErrors = Partial<
  Record<keyof FamilyRegistrationValues, string>
>;

// Define family registration form change handler type
export type FamilyRegistrationChangeHandler = (
  field: keyof FamilyRegistrationValues,
  value: string | boolean,
) => void;

export const createEmptyFamilyRegistrationValues = (): FamilyRegistrationValues => ({
  nationalID: "",
  familyHeadName: "",
  phoneNumber: "",
  totalMembers: "",
  isFemaleHeaded: false,
  femaleHeadReason: "",
  currentCampId: "",
  originalResidenceGovernorate: "",
  originalResidenceCity: "",
});