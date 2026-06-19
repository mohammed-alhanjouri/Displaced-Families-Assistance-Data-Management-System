import { createClient, type SupportedStorage } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = "dfadms-auth-token";
const rememberMeStorageKey = "dfadms-remember-me";

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}

const canUseBrowserStorage = () => typeof window !== "undefined";

// Choose storage based on the user's "remember me" preference
const getSelectedStorage = () => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  return window.localStorage.getItem(rememberMeStorageKey) === "true"
    ? window.localStorage
    : window.sessionStorage;
};

// Define a custom Supabase auth storage adapter
const authStorage: SupportedStorage = {
  // * Restore an existing auth session from the selected storage (localStorage or sessionStorage)
  getItem(key) {
    return getSelectedStorage()?.getItem(key) ?? null;
  },

  // * Prevent storing the auth session in both localStorage and sessionStorage 
  setItem(key, value) {
    // Choose selected storage
    const selectedStorage = getSelectedStorage();

    if (!selectedStorage || !canUseBrowserStorage()) {
      return;
    }
    // Remove the auth session from the unused storage
    const unusedStorage =
      selectedStorage === window.localStorage
        ? window.sessionStorage
        : window.localStorage;

    unusedStorage.removeItem(key);
    // Save the new auth session in the selected storage
    selectedStorage.setItem(key, value);
  },

  // * Remove the auth session from both localStorage and sessionStorage
  removeItem(key) {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

// * Restore the user's "remember me" preference from localStorage
export const getRememberMePreference = () => {
  if (!canUseBrowserStorage()) {
    return false;
  }

  return window.localStorage.getItem(rememberMeStorageKey) === "true";
};

// * Store the user's "remember me" preference in localStorage
export const setRememberMePreference = (rememberMe: boolean) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(rememberMeStorageKey, String(rememberMe));
  window.localStorage.removeItem(authStorageKey);
  window.sessionStorage.removeItem(authStorageKey);
};

// * Remove the auth session from both localStorage and sessionStorage
export const clearStoredAuthSession = () => {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(authStorageKey);
  window.sessionStorage.removeItem(authStorageKey);
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    storage: authStorage,
    storageKey: authStorageKey,
  },
});
