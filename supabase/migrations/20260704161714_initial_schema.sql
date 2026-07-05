SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."account_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."account_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'system_administrator',
    'data_entry_staff',
    'organization_manager'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_login_email"("login_identifier" "text") RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select p.email
  from public.profiles p
  where p.status = 'active'::public.account_status
    and lower(p.username) = lower(btrim(resolve_login_email.login_identifier))
  limit 1;
$$;


ALTER FUNCTION "public"."resolve_login_email"("login_identifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_families_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_families_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."camps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."camps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."families" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "national_id" "text" NOT NULL,
    "family_head_name" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "total_members" smallint NOT NULL,
    "is_female_headed" boolean DEFAULT false NOT NULL,
    "female_head_reason" "text",
    "current_camp_id" "uuid" NOT NULL,
    "original_residence_governorate" "text" NOT NULL,
    "original_residence_city" "text" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "families_city_not_blank" CHECK (("btrim"("original_residence_city") <> ''::"text")),
    CONSTRAINT "families_female_head_reason_required" CHECK (((NOT "is_female_headed") OR (NULLIF("btrim"("female_head_reason"), ''::"text") IS NOT NULL))),
    CONSTRAINT "families_governorate_not_blank" CHECK (("btrim"("original_residence_governorate") <> ''::"text")),
    CONSTRAINT "families_head_name_length" CHECK ((("char_length"("btrim"("family_head_name")) >= 2) AND ("char_length"("btrim"("family_head_name")) <= 120))),
    CONSTRAINT "families_national_id_format" CHECK (("national_id" ~ '^[0-9]{9}$'::"text")),
    CONSTRAINT "families_phone_number_format" CHECK (("phone_number" ~ '^[0-9]{10}$'::"text")),
    CONSTRAINT "families_total_members_range" CHECK ((("total_members" >= 1) AND ("total_members" <= 50)))
);


ALTER TABLE "public"."families" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_assistance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_id" "uuid" NOT NULL,
    "assistance_type" "text" NOT NULL,
    "assistance_date" "date" NOT NULL,
    "provider_organization" "text" NOT NULL,
    "notes" "text",
    "recorded_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "family_assistance_provider_not_blank" CHECK (("length"(TRIM(BOTH FROM "provider_organization")) > 0)),
    CONSTRAINT "family_assistance_type_not_blank" CHECK (("length"(TRIM(BOTH FROM "assistance_type")) > 0))
);


ALTER TABLE "public"."family_assistance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text" NOT NULL,
    "user_role" "public"."user_role" DEFAULT 'data_entry_staff'::"public"."user_role" NOT NULL,
    "assigned_camp_id" "uuid",
    "status" "public"."account_status" DEFAULT 'active'::"public"."account_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text",
    CONSTRAINT "profiles_username_format_check" CHECK ((("username" IS NULL) OR ("username" ~ '^[a-z0-9_]{3,64}$'::"text")))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vulnerability_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_id" "uuid" NOT NULL,
    "has_elderly_member" boolean DEFAULT false NOT NULL,
    "elderly_members_count" integer DEFAULT 0 NOT NULL,
    "has_disability" boolean DEFAULT false NOT NULL,
    "disabilities_count" integer DEFAULT 0 NOT NULL,
    "is_large_family" boolean DEFAULT false NOT NULL,
    "is_female_headed" boolean DEFAULT false NOT NULL,
    "score" integer NOT NULL,
    "level" "text" NOT NULL,
    "assessed_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vulnerability_disabilities_count_matches_flag" CHECK ((("has_disability" AND ("disabilities_count" > 0)) OR ((NOT "has_disability") AND ("disabilities_count" = 0)))),
    CONSTRAINT "vulnerability_disabilities_count_valid" CHECK (("disabilities_count" >= 0)),
    CONSTRAINT "vulnerability_elderly_count_matches_flag" CHECK ((("has_elderly_member" AND ("elderly_members_count" > 0)) OR ((NOT "has_elderly_member") AND ("elderly_members_count" = 0)))),
    CONSTRAINT "vulnerability_elderly_count_valid" CHECK (("elderly_members_count" >= 0)),
    CONSTRAINT "vulnerability_level_valid" CHECK (("level" = ANY (ARRAY['Low'::"text", 'Medium'::"text", 'High'::"text"]))),
    CONSTRAINT "vulnerability_score_valid" CHECK (("score" >= 0))
);


ALTER TABLE "public"."vulnerability_assessments" OWNER TO "postgres";


ALTER TABLE ONLY "public"."camps"
    ADD CONSTRAINT "camps_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."camps"
    ADD CONSTRAINT "camps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_national_id_key" UNIQUE ("national_id");



ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_assistance"
    ADD CONSTRAINT "family_assistance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."vulnerability_assessments"
    ADD CONSTRAINT "vulnerability_assessments_pkey" PRIMARY KEY ("id");



CREATE INDEX "families_created_by_idx" ON "public"."families" USING "btree" ("created_by");



CREATE INDEX "families_current_camp_id_idx" ON "public"."families" USING "btree" ("current_camp_id");



CREATE INDEX "family_assistance_family_date_idx" ON "public"."family_assistance" USING "btree" ("family_id", "assistance_date" DESC);



CREATE INDEX "profiles_assigned_camp_id_idx" ON "public"."profiles" USING "btree" ("assigned_camp_id");



CREATE INDEX "vulnerability_assessments_family_created_idx" ON "public"."vulnerability_assessments" USING "btree" ("family_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "set_families_updated_at" BEFORE UPDATE ON "public"."families" FOR EACH ROW EXECUTE FUNCTION "public"."set_families_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."families"
    ADD CONSTRAINT "families_current_camp_id_fkey" FOREIGN KEY ("current_camp_id") REFERENCES "public"."camps"("id");



ALTER TABLE ONLY "public"."family_assistance"
    ADD CONSTRAINT "family_assistance_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_assistance"
    ADD CONSTRAINT "family_assistance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_assigned_camp_id_fkey" FOREIGN KEY ("assigned_camp_id") REFERENCES "public"."camps"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vulnerability_assessments"
    ADD CONSTRAINT "vulnerability_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."vulnerability_assessments"
    ADD CONSTRAINT "vulnerability_assessments_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE;



CREATE POLICY "Active data entry staff can register families" ON "public"."families" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("profiles"."status" = 'active'::"public"."account_status") AND ("profiles"."assigned_camp_id" = "families"."current_camp_id"))))));



CREATE POLICY "Active data entry staff can update their registered families" ON "public"."families" FOR UPDATE TO "authenticated" USING ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("profiles"."status" = 'active'::"public"."account_status") AND ("profiles"."assigned_camp_id" = "families"."current_camp_id")))))) WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("profiles"."status" = 'active'::"public"."account_status") AND ("profiles"."assigned_camp_id" = "families"."current_camp_id"))))));



CREATE POLICY "Authenticated users can read camps" ON "public"."camps" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read families" ON "public"."families" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Data entry can create assistance for assigned camp" ON "public"."family_assistance" FOR INSERT TO "authenticated" WITH CHECK ((("recorded_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "family_assistance"."family_id"))))));



CREATE POLICY "Data entry can create vulnerability assessments for assigned ca" ON "public"."vulnerability_assessments" FOR INSERT TO "authenticated" WITH CHECK ((("assessed_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "vulnerability_assessments"."family_id"))))));



CREATE POLICY "Data entry can read assistance for assigned camp" ON "public"."family_assistance" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "family_assistance"."family_id")))));



CREATE POLICY "Data entry can read vulnerability assessments for assigned camp" ON "public"."vulnerability_assessments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "vulnerability_assessments"."family_id")))));



CREATE POLICY "Data entry can update own assistance records" ON "public"."family_assistance" FOR UPDATE TO "authenticated" USING ((("recorded_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "family_assistance"."family_id")))))) WITH CHECK ((("recorded_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "family_assistance"."family_id"))))));



CREATE POLICY "Data entry can update own vulnerability assessments" ON "public"."vulnerability_assessments" FOR UPDATE TO "authenticated" USING ((("assessed_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "vulnerability_assessments"."family_id")))))) WITH CHECK ((("assessed_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM ("public"."profiles" "profile"
     JOIN "public"."families" "family" ON (("family"."current_camp_id" = "profile"."assigned_camp_id")))
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = 'data_entry_staff'::"public"."user_role") AND ("family"."id" = "vulnerability_assessments"."family_id"))))));



CREATE POLICY "Data entry staff can choose assigned camp" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) AND ("user_role" = 'data_entry_staff'::"public"."user_role") AND ("status" = 'active'::"public"."account_status"))) WITH CHECK ((("id" = ( SELECT "auth"."uid"() AS "uid")) AND ("user_role" = 'data_entry_staff'::"public"."user_role") AND ("status" = 'active'::"public"."account_status")));



CREATE POLICY "Managers can read all assistance records" ON "public"."family_assistance" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profile"
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = ANY (ARRAY['system_administrator'::"public"."user_role", 'organization_manager'::"public"."user_role"]))))));



CREATE POLICY "Managers can read all vulnerability assessments" ON "public"."vulnerability_assessments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profile"
  WHERE (("profile"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profile"."status" = 'active'::"public"."account_status") AND ("profile"."user_role" = ANY (ARRAY['system_administrator'::"public"."user_role", 'organization_manager'::"public"."user_role"]))))));



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."camps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."families" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_assistance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vulnerability_assessments" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."resolve_login_email"("login_identifier" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."resolve_login_email"("login_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_login_email"("login_identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_families_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_families_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_families_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."camps" TO "service_role";
GRANT SELECT ON TABLE "public"."camps" TO "authenticated";



GRANT ALL ON TABLE "public"."families" TO "authenticated";
GRANT ALL ON TABLE "public"."families" TO "service_role";



GRANT ALL ON TABLE "public"."family_assistance" TO "anon";
GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."family_assistance" TO "authenticated";
GRANT ALL ON TABLE "public"."family_assistance" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("assigned_camp_id") ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."vulnerability_assessments" TO "anon";
GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."vulnerability_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."vulnerability_assessments" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







