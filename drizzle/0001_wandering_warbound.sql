ALTER TABLE "signup_user" DROP CONSTRAINT "signup_user_signup_id_signups_id_fk";
--> statement-breakpoint
ALTER TABLE "signup_user" DROP COLUMN IF EXISTS "signup_id";