import { supabase } from "./supabase";

export interface Camp {
  id: string;
  name: string;
}

export const fetchCamps = async () => {
  const { data, error } = await supabase
    .from("camps")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Camp[];
};
