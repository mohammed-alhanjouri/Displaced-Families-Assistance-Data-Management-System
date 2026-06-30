import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAuth } from "../features/auth/useAuth";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  adminUserRoleOptions,
  createAdminUser,
  fetchAdminUsers,
  getAdminUserRoleLabel,
  sortAdminUsersByName,
  updateAdminUser,
  updateAdminUserStatus,
  type AccountStatus,
  type AdminUserAccount,
  type AdminUserFormPayload,
} from "../lib/adminUsers";
import { fetchCamps, type Camp } from "../lib/camps";

const pageSize = 5;

const emptyForm: AdminUserFormPayload = {
  fullName: "",
  email: "",
  username: "",
  password: "",
  role: "data_entry_staff",
  assignedCampId: null,
  status: "active",
};

// Define reusable Tailwind class names
const fieldClassName =
  "mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-700 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF]";
const selectClassName = `${fieldClassName} disabled:cursor-not-allowed disabled:bg-gray-100`;
const primaryButtonClassName =
  "rounded-md bg-[#0066FF] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClassName =
  "rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const paginationButtonClassName =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [form, setForm] = useState<AdminUserFormPayload>({ ...emptyForm });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  // Initial data loading effect to fetch admin users and camp options when the component mounts
  useEffect(() => {
    let isActive = true;

    const loadAdminData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        // Fetch both admin users and camp options concurrently to optimize loading time
        const [adminUsers, campOptions] = await Promise.all([
          fetchAdminUsers(),
          fetchCamps(),
        ]);

        if (isActive) {
          setUsers(sortAdminUsersByName(adminUsers));
          setCamps(campOptions);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load user management data.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      isActive = false;
    };
  }, []);

  //  Calculate pagination details based on the current page and total number of users
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  // Use useMemo to compute the visible users for the current page, optimizing performance by avoiding unnecessary recalculations
  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [currentPage, users]);

  // Convert editingUserId to boolean to determine if the form is in editing mode, and check if the current user is being edited
  const isEditing = Boolean(editingUserId);
  const isEditingCurrentUser = editingUserId === currentUser?.id;

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingUserId(null);
    setFormError("");
    setMessage("");
  };

  const updateFormField = (
    field: keyof AdminUserFormPayload,
    value: string,
  ) => {
    setForm((current) => {
      if (field === "role") {
        return {
          ...current,
          role: value as AdminUserFormPayload["role"],
          assignedCampId:
            value === "data_entry_staff" ? current.assignedCampId : null,
        };
      }

      if (field === "assignedCampId") {
        return {
          ...current,
          assignedCampId: value || null,
        };
      }

      if (field === "status") {
        return {
          ...current,
          status: value as AccountStatus,
        };
      }

      return {
        ...current,
        [field]: field === "username" ? value.toLowerCase() : value,
      };
    });
  };

  // Validate the form fields before submission, ensuring required fields are filled and meet specific criteria
  const validateForm = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.username.trim()) {
      return "Enter the user's full name, email, and username.";
    }

    if (!isEditing && !form.password?.trim()) {
      return "Enter an initial password for the new user.";
    }

    if (form.password && form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (form.role === "data_entry_staff" && !form.assignedCampId) {
      return "Assign a camp for data entry staff.";
    }

    return "";
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the payload for creating or updating the admin user, trimming whitespace and normalizing email and username to lowercase
      const payload: AdminUserFormPayload = {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim().toLowerCase(),
        password: form.password?.trim() || undefined,
        assignedCampId:
          form.role === "data_entry_staff" ? form.assignedCampId : null,
      };

      // Determine whether to create a new user or update an existing one based on the editing state
      const savedUser =
        isEditing && editingUserId
          ? await updateAdminUser(editingUserId, payload)
          : await createAdminUser(payload);

      // Update the users state with the newly created or updated user
      setUsers((current) =>
        sortAdminUsersByName(
          isEditing
            ? current.map((account) =>
                account.id === savedUser.id ? savedUser : account,
              )
            : [savedUser, ...current],
        ),
      );
      setMessage(isEditing ? "User account updated." : "User account created.");
      setForm({ ...emptyForm });
      setEditingUserId(null);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save user account.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (account: AdminUserAccount) => {
    setEditingUserId(account.id);
    // Pre-fill the form with the selected user's data for editing, excluding the password field to keep the current password
    setForm({
      fullName: account.fullName,
      email: account.email,
      username: account.username,
      password: "",
      role: account.role,
      assignedCampId: account.assignedCampId,
      status: account.status,
    });
    setFormError("");
    setMessage("");
  };

  // Handle toggling the status of an admin user
  const handleStatusToggle = async (account: AdminUserAccount) => {
    const nextStatus: AccountStatus =
      account.status === "active" ? "inactive" : "active";
    setStatusActionId(account.id);
    setFormError("");
    setMessage("");

    try {
      // Update the user's status using the updateAdminUserStatus function and update the users state with the new status
      const updatedUser = await updateAdminUserStatus(account.id, nextStatus);
      setUsers((current) =>
        sortAdminUsersByName(
          current.map((userAccount) =>
            userAccount.id === updatedUser.id ? updatedUser : userAccount,
          ),
        ),
      );
      setMessage(
        nextStatus === "active"
          ? "User account activated."
          : "User account deactivated.",
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to update user status.",
      );
    } finally {
      setStatusActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "User Management" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-gray-800">
            Manage User Accounts
          </h1>
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEditing ? "Edit User" : "Add New User"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-5" aria-busy={isSaving}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <input
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  updateFormField("fullName", event.target.value)
                }
                className={fieldClassName}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateFormField("email", event.target.value)
                }
                className={fieldClassName}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Username
              <input
                type="text"
                value={form.username}
                onChange={(event) =>
                  updateFormField("username", event.target.value)
                }
                className={fieldClassName}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              {isEditing ? "New Password" : "Password"}
              <input
                type="password"
                value={form.password ?? ""}
                onChange={(event) =>
                  updateFormField("password", event.target.value)
                }
                placeholder={isEditing ? "Leave blank to keep current" : ""}
                className={`${fieldClassName} placeholder:text-gray-400`}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Role
              <select
                value={form.role}
                onChange={(event) =>
                  updateFormField("role", event.target.value)
                }
                disabled={isSaving || isEditingCurrentUser}
                className={selectClassName}
              >
                {adminUserRoleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Assigned Camp
              <select
                value={form.assignedCampId ?? ""}
                onChange={(event) =>
                  updateFormField("assignedCampId", event.target.value)
                }
                disabled={isSaving || form.role !== "data_entry_staff"}
                className={selectClassName}
              >
                <option value="">
                  {form.role === "data_entry_staff" ? "Select a camp" : "N/A"}
                </option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          {message && (
            <p className="mt-4 text-sm text-green-700" role="status">
              {message}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className={primaryButtonClassName}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className={secondaryButtonClassName}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
        {isLoading ? (
          <p className="text-sm font-medium text-gray-600">Loading users...</p>
        ) : loadError ? (
          <p className="text-sm text-red-600" role="alert">
            {loadError}
          </p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-600">No user accounts found.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Full Name
                    </th>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Username
                    </th>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Role
                    </th>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Assigned Camp
                    </th>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Status
                    </th>
                    <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {visibleUsers.map((account) => {
                    const isSelf = account.id === currentUser?.id;
                    const isStatusLoading = statusActionId === account.id;
                    const nextStatusLabel =
                      account.status === "active" ? "Deactivate" : "Activate";

                    return (
                      <tr key={account.id}>
                        <td className="px-3 py-3 font-medium text-gray-800">
                          {account.fullName || account.email}
                        </td>
                        <td className="px-3 py-3">{account.username}</td>
                        <td className="px-3 py-3">
                          {getAdminUserRoleLabel(account.role)}
                        </td>
                        <td className="px-3 py-3">
                          {account.assignedCampName ?? "N/A"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              account.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {account.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(account)}
                              className="font-medium text-[#0066FF] underline hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(account)}
                              disabled={
                                isStatusLoading ||
                                (isSelf && account.status === "active")
                              }
                              className="font-medium text-[#0066FF] underline hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                              {isStatusLoading
                                ? "Updating..."
                                : nextStatusLabel}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className={paginationButtonClassName}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                      pageNumber === currentPage
                        ? "border-gray-300 bg-gray-300 text-gray-900"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={currentPage === totalPages}
                className={paginationButtonClassName}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  );
};

export default UserManagementPage;
