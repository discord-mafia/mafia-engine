import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	MAIN_SERVER_ID: z.string(),
	TICK_INTERVAL: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const env = envSchema.parse(process.env);

export default {
	...env,
};
