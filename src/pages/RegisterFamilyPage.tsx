import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCamps, type Camp } from "../lib/camps";
import { supabase } from "../lib/supabase";
import { useAuth } from "../features/auth/useAuth";
import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import HouseholdInformationCard from "../features/register-family/HouseholdInformationCard";
import LocationInformationCard from "../features/register-family/LocationInformationCard";
import {
  createEmptyFamilyRegistrationValues,
  type FamilyRegistrationChangeHandler,
  type FamilyRegistrationErrors,
  type FamilyRegistrationValues,
} from "../features/register-family/formTypes";
import RegisterFamilyLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";

const RegisterFamilyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Define a function to create initial empty values for the form, and preselect the assigned camp
  const createInitialValues = () => ({
    ...createEmptyFamilyRegistrationValues(),
    currentCampId: user?.assignedCampId ?? "",
  });

  // State variables for form values, errors, camps, loading states, and messages
  const [values, setValues] =
    useState<FamilyRegistrationValues>(createInitialValues);
  const [errors, setErrors] = useState<FamilyRegistrationErrors>({});
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [campLoadError, setCampLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter loaded camps based on the user's assigned camp,
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

    const loadCamps = async () => {
      try {
        const campOptions = await fetchCamps();

        if (isActive) {
          setCamps(campOptions);
        }
      } catch (error) {
        if (isActive) {
          setCampLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load camps. Refresh the page and try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingCamps(false);
        }
      }
    };

    void loadCamps();

    return () => {
      isActive = false;
    };
  }, []);

  // Handle changes to form fields
  const handleFieldChange: FamilyRegistrationChangeHandler = (field, value) => {
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
    setSuccessMessage("");
  };

  // Validate the form values and return any validation errors
  const validate = () => {
    const validationErrors: FamilyRegistrationErrors = {};
    const memberCount = Number(values.totalMembers);

    if (!/^\d{9}$/.test(values.nationalID)) {
      validationErrors.nationalID =
        "National ID must contain exactly 9 digits.";
    }

    if (values.familyHeadName.trim().length < 2) {
      validationErrors.familyHeadName = "Enter the family head's full name.";
    }

    if (!/^\d{10}$/.test(values.phoneNumber)) {
      validationErrors.phoneNumber =
        "Phone number must contain exactly 10 digits.";
    }

    if (!Number.isInteger(memberCount) || memberCount < 1 || memberCount > 50) {
      validationErrors.totalMembers =
        "Total members must be a whole number from 1 to 50.";
    }

    if (values.isFemaleHeaded && !values.femaleHeadReason.trim()) {
      validationErrors.femaleHeadReason =
        "Enter the reason for the female-headed household.";
    }

    if (!values.currentCampId) {
      validationErrors.currentCampId = "Select the family's current camp.";
    }

    if (!values.originalResidenceGovernorate) {
      validationErrors.originalResidenceGovernorate =
        "Select the original residence governorate.";
    }

    if (!values.originalResidenceCity) {
      validationErrors.originalResidenceCity =
        "Select the original residence city.";
    }

    return validationErrors;
  };

  // Handle form submission, validate the form, and save the registration to the database
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();

    setErrors(validationErrors);
    setFormError("");
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      setFormError(
        "Correct the highlighted fields before saving the registration.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Insert the new family registration into the "families" table, and handle any errors that occur during insertion
      const { error } = await supabase
        .from("families")
        .insert({
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
        .select("id")
        .single();

      if (error) {
        // Error Code 23505: duplicate unique value, here National ID
        if (error.code === "23505") {
          setErrors({
            nationalID: "A family with this National ID is already registered.",
          });
          setFormError("This family is already registered.");
          return;
        }

        // Error Code 42501: authorization/RLS failure
        if (error.code === "42501") {
          throw new Error(
            "You are not authorized to register a family. Sign in again or contact the system administrator.",
          );
        }

        throw new Error(
          "Unable to save the family registration. Please try again.",
        );
      }

      // Reset the form to its initial state and display a success message after successful registration
      setValues(createInitialValues());
      setErrors({});
      setSuccessMessage("Family registration saved successfully.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save the family registration. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/local-search");
  };

  return (
    <RegisterFamilyLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/data-entry-dashboard" },
            { label: "Register Family", href: "/register-family" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Register New Family
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Now, every card receives values, errors, and handleFieldChange */}
        <FamilyIdentificationCard
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          disabled={isSubmitting}
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
        {successMessage && (
          <p className="mt-4 text-sm text-green-700" role="status">
            {successMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCamps || Boolean(locationError)}
            className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
          >
            {isSubmitting ? "Saving..." : "Save Registration"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </RegisterFamilyLayout>
  );
};

export default RegisterFamilyPage;
