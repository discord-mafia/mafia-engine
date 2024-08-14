import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	MAIN_SERVER_ID: z.string(),
	PLAYERCHAT_SERVER_ID: z.string(),
	TURBO_SERVER_ID: z.string(),

	VITE_REACT_APP_CLERK_PUBLISHABLE_KEY: z.string().optional(),
	DISCORD_OAUTH_REDIRECT_URI: z.string().optional(),
	GENERAL_LOG_WEBHOOK: z.string().url().optional(),
	SIGNUP_LOG_WEBHOOK: z.string().url().nullish(),

	UNSPLASH_CLIENT_ID: z.string().optional(),
});

export function fetchConfig() {
	return envSchema.parse(process.env);
}

export default fetchConfig();
