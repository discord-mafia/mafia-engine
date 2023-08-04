import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	TICK_INTERVAL: z.string().regex(/^\d+$/).transform(Number).optional(),

	MAIN_SERVER_ID: z.string(),
	PLAYERCHAT_SERVER_ID: z.string(),
	TURBO_SERVER_ID: z.string(),
	LOG_WEBHOOK_URL: z.string().url().nullish(),
});

export const env = envSchema.parse(process.env);

export default {
	...env,
};
