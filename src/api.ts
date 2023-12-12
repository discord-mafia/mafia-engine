import express from 'express';
import path from 'path';
import config from './config';

export const app = express();
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
