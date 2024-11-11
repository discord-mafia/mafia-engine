import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	UNSPLASH_TOKEN: z.string().optional(),
	TMP_SIGNUP_LOG_WEBHOOK: z.string().optional(),
});

export function fetchConfig() {
	return envSchema.parse(process.env);
}

export default fetchConfig();
