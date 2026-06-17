import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole =
  | "system_administrator"
  | "organization_manager"
  | "data_entry_staff";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  user_role: UserRole;
  status: "active" | "inactive";
  assigned_camp_id: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  user_role: string | null;
  status: string | null;
  assigned_camp_id: string | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const WORKING_CAMP_ID_STORAGE_KEY = "dfadms-working-camp-id";
export const WORKING_CAMP_NAME_STORAGE_KEY = "dfadms-working-camp-name";

export const roleLabels: Record<UserRole, string> = {
  system_administrator: "System Administrator",
  organization_manager: "Organization Manager",
  data_entry_staff: "Data Entry Staff",
};

export const normalizeRole = (role: string | null | undefined): UserRole | null => {
  const normalized = role?.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (normalized === "system_administrator" || normalized === "system_admin") {
    return "system_administrator";
  }

  if (normalized === "organization_manager" || normalized === "org_manager") {
    return "organization_manager";
  }

  if (normalized === "data_entry_staff" || normalized === "data_entry") {
    return "data_entry_staff";
  }

  return null;
};

export const getRoleLabel = (role: UserRole) => roleLabels[role];

export const getHomePathForRole = (role: UserRole) => {
  if (role === "system_administrator") {
    return "/user-management";
  }

  if (role === "data_entry_staff") {
    return "/register-family";
  }

  return "/dashboard";
};

const mapProfileRow = (row: ProfileRow): UserProfile | null => {
  const role = normalizeRole(row.user_role);

  if (!role) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    username: row.username,
    user_role: role,
    status: row.status === "inactive" ? "inactive" : "active",
    assigned_camp_id: row.assigned_camp_id,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);

    if (!currentSession?.user) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, username, user_role, status, assigned_camp_id")
      .eq("id", currentSession.user.id)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      return null;
    }

    const mappedProfile = mapProfileRow(data as ProfileRow);
    setProfile(mappedProfile);
    return mappedProfile;
  }, []);

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(WORKING_CAMP_ID_STORAGE_KEY);
    window.localStorage.removeItem(WORKING_CAMP_NAME_STORAGE_KEY);
    window.sessionStorage.removeItem(WORKING_CAMP_ID_STORAGE_KEY);
    window.sessionStorage.removeItem(WORKING_CAMP_NAME_STORAGE_KEY);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      await refreshProfile();

      if (isMounted) {
        setLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const value = useMemo(
    () => ({ session, profile, loading, refreshProfile, signOut }),
    [session, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
