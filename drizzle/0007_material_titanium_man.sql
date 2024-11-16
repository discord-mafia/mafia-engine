DO $$ BEGIN
 CREATE TYPE "public"."game_queue" AS ENUM('newcomer', 'main', 'special', 'community', 'arcade', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."participant_type" AS ENUM('player', 'spectator', 'host', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"queue" "game_queue" NOT NULL,
	"queue_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"usergroup_id" integer NOT NULL,
	"name" varchar(32),
	"user_id" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usergroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" "participant_type" NOT NULL,
	"game_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_usergroup_id_usergroups_id_fk" FOREIGN KEY ("usergroup_id") REFERENCES "public"."usergroups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usergroups" ADD CONSTRAINT "usergroups_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
