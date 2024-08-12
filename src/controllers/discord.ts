import fs from 'fs';
import path from 'path';

export async function startDiscordBot() {
	await loadInteractions();
}

async function loadInteractions() {
	const interactionPath = path.join(__dirname, '..', 'interactions');
	const loadFiles = async (dirPath: string) => {
		try {
			const files = fs.readdirSync(dirPath);
			for (const file of files) {
				const filePath = path.join(dirPath, file);
				const stats = fs.statSync(filePath);
				if (stats.isDirectory()) {
					await loadFiles(filePath); // Recursive call for subdirectories
				} else if (
					stats.isFile() &&
					(file.endsWith('.ts') || file.endsWith('.js'))
				) {
					try {
						const _ = import(filePath);
					} catch (err) {
						console.log(
							`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`
						);
					}
				}
			}
		} catch (err) {
			console.log(
				`\x1B[31mFailed to load directory: \x1B[34m${interactionPath}\x1B[0m`
			);
		}
	};

	await loadFiles(interactionPath);
	console.log('[BOT] Loaded interactions');
}
