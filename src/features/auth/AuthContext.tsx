// This component is responsible for providing authentication state and actions to the rest of the app.
// useState stores auth state,
// useEffect checks auth on load,
// useCallback stabilizes functions,
// useMemo stabilizes the context value.
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { clearStoredAuthSession, supabase } from "../../lib/supabase";
import { getCurrentAuthUser, type AuthUser } from "./auth";
import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthUser = useCallback(async () => {
    setLoading(true);

    try {
      const authUser = await getCurrentAuthUser();
      setUser(authUser);
      return authUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearStoredAuthSession();
    setUser(null);
  }, []);

  // Check the current auth state on component mount and set up a listener for auth state changes
  useEffect(() => {
    // Protect against setting state on an unmounted component before the async auth check completes
    let isMounted = true;

    const loadInitialUser = async () => {
      // Any error becomes as a null user, which is the unauthenticated state (logged-out state)
      const authUser = await getCurrentAuthUser().catch(() => null);

      if (!isMounted) {
        return;
      }

      setUser(authUser);
      setLoading(false);
    };

    // Run the async function without awaiting it directly in useEffect, since useEffect cannot be async.
    // This allows the component to render immediately and then update once the auth check completes.
    void loadInitialUser();

    // Supabase Auth Events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        return;
      }
      // After auth state changes, refresh the auth user to get the latest user data and role information
      void refreshAuthUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshAuthUser]);

  // Memoize the context value to prevent unnecessary re-renders, only updating when user, loading, refreshAuthUser, or signOut changes.
  const contextValue = useMemo(
    () => ({ user, loading, refreshAuthUser, signOut }),
    [user, loading, refreshAuthUser, signOut],
  );

  return (
    // Provide the auth context to the rest of the app
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
