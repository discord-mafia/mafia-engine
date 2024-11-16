CREATE TABLE IF NOT EXISTS "game_hosts" (
	"game_id" integer NOT NULL,
	"user_id" varchar(32) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_hosts" ADD CONSTRAINT "game_hosts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_hosts" ADD CONSTRAINT "game_hosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
