import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_REDIRECT_URI: z.string(),
	TICK_INTERVAL: z.string().regex(/^\d+$/).transform(Number).optional(),
	PORT: z.string().transform(Number).optional().default('4000'),
	WEB_URL: z.string().url().default('http://localhost:5173'),
	MAIN_SERVER_ID: z.string(),
	PLAYERCHAT_SERVER_ID: z.string(),
	TURBO_SERVER_ID: z.string(),

	VITE_REACT_APP_CLERK_PUBLISHABLE_KEY: z.string().optional(),
	DISCORD_OAUTH_REDIRECT_URI: z.string().optional(),
	GENERAL_LOG_WEBHOOK: z.string().url().optional(),
	SIGNUP_LOG_WEBHOOK: z.string().url().nullish(),
});

export function fetchConfig() {
	return envSchema.parse(process.env);
}

export default fetchConfig();
