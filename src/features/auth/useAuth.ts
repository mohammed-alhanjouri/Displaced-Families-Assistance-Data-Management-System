import { createContext, useContext } from "react";
import type { AuthUser } from "./auth";

// Define the auth context value type
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshAuthUser: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

// Custom hook to use the auth context, ensuring it is used within an AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
