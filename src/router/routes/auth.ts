import { Request } from 'express';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import config from '../../config';
import axios from 'axios';

export const auth = router({
	test: publicProcedure.query(({ ctx: { req } }) => {
		return {
			status: 'ok',
		};
	}),

	oauth: publicProcedure.query(async ({ ctx: { req } }) => {
		return config.DISCORD_OAUTH_REDIRECT_URI;
	}),
	callback: publicProcedure.input(z.object({ code: z.string() })).mutation(async ({ ctx: { req }, input: { code } }) => {
		try {
			const params = new URLSearchParams();
			params.append('client_id', config.DISCORD_CLIENT_ID);
			params.append('client_secret', config.DISCORD_TOKEN);
			params.append('grant_type', 'authorization_code');
			params.append('redirect_uri', 'http://localhost:5173');
			params.append('scope', 'identify');
			params.append('code', code);
			const headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
			};
			const response = await axios.post('https://discord.com/oauth2/authorize', params, {
				headers,
			});

			console.log(response.status);

			return response.data;
		} catch (err) {
			console.log(err);
			return { error: err };
		}
	}),
});
