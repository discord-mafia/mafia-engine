import express from 'express';
import path from 'path';
import cors from 'cors';
import config from './config';

import { router as apiRouter } from './routers/apiRouter';

export const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', apiRouter);

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
