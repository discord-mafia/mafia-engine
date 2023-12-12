import { type BaseInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';

type CustomID = string;

export class InteractionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InteractionError';
	}
}

export class Interaction {
	private customId: CustomID;

	constructor(customId: CustomID) {
		this.customId = customId;
		console.log(`Loaded [${this.customId}]`);
	}

	public getCustomID() {
		return this.customId;
	}

	public createCustomID(data: string | undefined) {
		if (!data) return this.getCustomID();
		return `${this.customId}_${data}`;
	}

	static getDataFromCustomID(customIdString: string): [CustomID, string | undefined] {
		const split = customIdString.split('_');
		const customId = split.shift();
		const data = split.join('_');
		if (!customId) return [customIdString, undefined];
		if (!data) return [customId, ''];
		return [customId, data];
	}

	async onError(i: BaseInteraction, err: unknown) {
		let errorMessage;

		if (err instanceof InteractionError) errorMessage = err.message;
		else if (err instanceof Error) errorMessage = err.message;
		else if (typeof err === 'string') errorMessage = err;
		else errorMessage = 'An unknown error occurred';

		if (i.isMessageComponent()) {
			{
				try {
					if (i.deferred || i.replied) {
						await i.editReply({
							content: errorMessage,
						});
					} else if (i.isRepliable()) {
						await i.reply({
							content: errorMessage,
							ephemeral: true,
						});
					} else {
						throw new Error(errorMessage);
					}
				} catch (error) {
					console.error('Failed to send error message:', error);
				}
			}
		} else {
			if (i.isRepliable()) {
				await i.reply({
					content: errorMessage,
					ephemeral: true,
				});
			} else {
				console.error('Failed to send error message:', err);
			}
		}
	}
}

export async function loadInteractions(newPath: string, recursive: boolean = true) {
	const commandPath = newPath;

	const loadFiles = async (dirPath: string) => {
		try {
			const files = fs.readdirSync(dirPath);
			for (const file of files) {
				const filePath = path.join(dirPath, file);
				const stats = fs.statSync(filePath);
				if (stats.isDirectory() && recursive) {
					await loadFiles(filePath); // Recursive call for subdirectories
				} else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
					try {
						// eslint-disable-next-line @typescript-eslint/no-var-requires
						const fileData = require(filePath);
						for (const key in fileData) {
							const value = fileData[key];
							if (value.prototype instanceof Interaction) {
								new value();
							}
						}
					} catch (err) {
						console.log(`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`);
						console.error(err);
					}
				}
			}
		} catch (err) {
			console.log(`\x1B[31mFailed to load directory: \x1B[34m${newPath}\x1B[0m`);
		}
	};

	await loadFiles(commandPath);
}
