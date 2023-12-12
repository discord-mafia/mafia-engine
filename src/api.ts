import express from 'express';
import path from 'path';
import config from './config';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from '@structures/trpc';

export const app = express();

app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext,
	})
);

const webAppPath = path.join(__dirname, '..', 'web', 'dist');
app.use(express.static(webAppPath));
app.get('*', (req, res) => {
	res.sendFile(path.join(webAppPath, 'index.html'));
});

export function startServer() {
	app.listen(config.PORT, () => {
		console.log(`Server is running on port ${config.PORT}`);
	});
}
