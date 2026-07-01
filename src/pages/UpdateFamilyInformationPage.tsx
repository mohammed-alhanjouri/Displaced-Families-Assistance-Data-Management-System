import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCamps, type Camp } from "../lib/camps";
import {
  fetchFamilyByNationalId,
  updateFamilyByNationalId,
  type FamilyRecord,
} from "../lib/families";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/useAuth";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import HouseholdInformationCard from "../features/register-family/HouseholdInformationCard";
import LocationInformationCard from "../features/register-family/LocationInformationCard";
import {
  createEmptyFamilyRegistrationValues,
  type FamilyRegistrationChangeHandler,
  type FamilyRegistrationErrors,
  type FamilyRegistrationValues,
} from "../features/register-family/formTypes";

// Convert a FamilyRecord to FamilyRegistrationValues, which is the format used by the form
const toFormValues = (family: FamilyRecord): FamilyRegistrationValues => ({
  nationalID: family.nationalId,
  familyHeadName: family.familyHeadName,
  phoneNumber: family.phoneNumber,
  totalMembers: String(family.totalMembers),
  isFemaleHeaded: family.isFemaleHeaded,
  femaleHeadReason: family.femaleHeadReason ?? "",
  currentCampId: family.currentCampId,
  originalResidenceGovernorate: family.originalResidenceGovernorate,
  originalResidenceCity: family.originalResidenceCity,
});

// Validate the form values
const validate = (values: FamilyRegistrationValues) => {
  const errors: FamilyRegistrationErrors = {};
  const memberCount = Number(values.totalMembers);

  if (!/^\d{9}$/.test(values.nationalID)) {
    errors.nationalID = "National ID must contain exactly 9 digits.";
  }

  if (values.familyHeadName.trim().length < 2) {
    errors.familyHeadName = "Enter the family head's full name.";
  }

  if (!/^\d{10}$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Phone number must contain exactly 10 digits.";
  }

  if (!Number.isInteger(memberCount) || memberCount < 1 || memberCount > 50) {
    errors.totalMembers = "Total members must be a whole number from 1 to 50.";
  }

  if (values.isFemaleHeaded && !values.femaleHeadReason.trim()) {
    errors.femaleHeadReason =
      "Enter the reason for the female-headed household.";
  }

  if (!values.currentCampId) {
    errors.currentCampId = "Select the family's current camp.";
  }

  if (!values.originalResidenceGovernorate) {
    errors.originalResidenceGovernorate =
      "Select the original residence governorate.";
  }

  if (!values.originalResidenceCity) {
    errors.originalResidenceCity = "Select the original residence city.";
  }

  return errors;
};

const getErrorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const UpdateFamilyInformation = () => {
  const { nationalID } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Call the function that creates the initial empty form values
  const [values, setValues] = useState<FamilyRegistrationValues>(
    createEmptyFamilyRegistrationValues,
  );

  // State variables for form values, errors, loading states, and messages
  const [errors, setErrors] = useState<FamilyRegistrationErrors>({});
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [campLoadError, setCampLoadError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter loaded camps based on user's assigned camp,
  // and set an error message if the user has no assigned camp
  const availableCamps = user?.assignedCampId
    ? camps.filter((camp) => camp.id === user.assignedCampId)
    : [];
  const locationError =
    campLoadError ||
    (!user?.assignedCampId
      ? "Your account does not have an assigned working camp. Contact the system administrator."
      : "");

  useEffect(() => {
    let isActive = true;

    const loadPage = async () => {
      if (!nationalID) {
        if (isActive) {
          setLoadError("A National ID is required to update a family.");
          setIsLoading(false);
          setIsLoadingCamps(false);
        }
        return;
      }

      try {
        const [campOptions, family] = await Promise.all([
          fetchCamps(),
          fetchFamilyByNationalId(nationalID),
        ]);

        if (!isActive) {
          return;
        }

        setCamps(campOptions);
        setIsLoadingCamps(false);

        if (!family) {
          setLoadError("No registered family was found with this National ID.");
          return;
        }

        setValues(toFormValues(family));
      } catch (error) {
        if (isActive) {
          const message = getErrorMessage(
            error,
            "Unable to load family information. Refresh the page and try again.",
          );
          setLoadError(message);
          setCampLoadError(message);
          setIsLoadingCamps(false);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isActive = false;
    };
  }, [nationalID]);

  // Handle changes to form fields
  const handleFieldChange: FamilyRegistrationChangeHandler = (field, value) => {
    if (field === "nationalID") {
      return;
    }

    setValues((currentValues) => {
      // If the "isFemaleHeaded" field is changed, reset the "femaleHeadReason" if it's set to false
      if (field === "isFemaleHeaded") {
        return {
          ...currentValues,
          isFemaleHeaded: value as boolean,
          femaleHeadReason: value ? currentValues.femaleHeadReason : "",
        };
      }

      // If the "originalResidenceGovernorate" field is changed, reset the "originalResidenceCity" to an empty string
      if (field === "originalResidenceGovernorate") {
        return {
          ...currentValues,
          originalResidenceGovernorate: value as string,
          originalResidenceCity: "",
        };
      }

      // For all other fields, simply update the value
      return { ...currentValues, [field]: value };
    });

    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFormError("");
  };

  // Handle form submission
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nationalID) {
      setFormError("A National ID is required to update a family.");
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Correct the highlighted fields before saving the update.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user: authenticatedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authenticatedUser) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Update editable family information and navigate to the profile page on success.
      const updatedFamily = await updateFamilyByNationalId(nationalID, {
        familyHeadName: values.familyHeadName,
        phoneNumber: values.phoneNumber,
        totalMembers: values.totalMembers,
        isFemaleHeaded: values.isFemaleHeaded,
        femaleHeadReason: values.femaleHeadReason,
        currentCampId: values.currentCampId,
        originalResidenceGovernorate: values.originalResidenceGovernorate,
        originalResidenceCity: values.originalResidenceCity,
      });

      navigate(`/families/${updatedFamily.nationalId}`, {
        replace: true,
        state: { successMessage: "Family information updated successfully." },
      });
    } catch (error) {
      const errorCode = getErrorCode(error);

      if (errorCode === "23505") {
        setFormError("This update conflicts with an existing family record.");
      } else if (errorCode === "42501") {
        setFormError(
          "You are not authorized to update this family. You can update only families you registered in your assigned camp.",
        );
      } else {
        setFormError(
          getErrorMessage(
            error,
            "Unable to save the family update. Please try again.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(nationalID ? `/families/${nationalID}` : "/local-search");
  };

  if (isLoading) {
    return (
      <RegisterFamilyPageLayout>
        <p className="text-sm text-gray-600">Loading family information...</p>
      </RegisterFamilyPageLayout>
    );
  }

  if (loadError) {
    return (
      <RegisterFamilyPageLayout>
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Unable to Update Family
          </h1>
          <p className="mt-3 text-sm text-red-600" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => navigate("/local-search")}
            className="mt-5 rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
          >
            Back to Local Search
          </button>
        </div>
      </RegisterFamilyPageLayout>
    );
  }

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Local Search", href: "/local-search" },
            { label: "Family Profile", href: `/families/${nationalID}` },
            {
              label: "Update Information",
              href: `/update-family/${nationalID}`,
            },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Update Family Information
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FamilyIdentificationCard
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          disabled={isSubmitting}
          isNationalIdReadOnly
        />
        <HouseholdInformationCard
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          disabled={isSubmitting}
        />
        <LocationInformationCard
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          camps={availableCamps}
          isLoadingCamps={isLoadingCamps}
          campLoadError={locationError}
          disabled={isSubmitting}
        />

        {formError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCamps || Boolean(locationError)}
            className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </RegisterFamilyPageLayout>
  );
};

export default UpdateFamilyInformation;
