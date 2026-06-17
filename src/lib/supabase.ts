import { createClient } from "@supabase/supabase-js";

export const REMEMBER_ME_STORAGE_KEY = "dfadms-remember-me";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}

const shouldRememberSession = () =>
  window.localStorage.getItem(REMEMBER_ME_STORAGE_KEY) === "true";

const getActiveStorage = () =>
  shouldRememberSession() ? window.localStorage : window.sessionStorage;

const getInactiveStorage = () =>
  shouldRememberSession() ? window.sessionStorage : window.localStorage;

const authStorage = {
  getItem: (key: string) =>
    window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key),
  setItem: (key: string, value: string) => {
    getInactiveStorage().removeItem(key);
    getActiveStorage().setItem(key, value);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: authStorage,
  },
});
