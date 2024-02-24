import { ColorResolvable, WebhookClient } from 'discord.js';
import config from '../config';
import { genLoggerEmbed } from '../views/logger';
import { genCUID } from './random';

export enum LogType {
	Error = 'Error',
	Info = 'Info',
	Debug = 'Debug',
	Critical = 'Critical',
	Success = 'Success',
}

export class Logger {
	private cuid: string;
	private webhookUrl: string | undefined;
	constructor(webhookUrl?: string) {
		this.cuid = genCUID();
		if (webhookUrl) this.webhookUrl = webhookUrl;
		else this.webhookUrl = config.GENERAL_LOG_WEBHOOK ?? undefined;
	}

	public log(type: LogType, message: string, color?: ColorResolvable) {
		if (!this.webhookUrl) return console.log(`[${type}] [${this.cuid}] ${message}`);

		try {
			const webhook = new WebhookClient({ url: this.webhookUrl });
			const embed = genLoggerEmbed(this.cuid, type, message, color);
			return webhook.send({ embeds: [embed] });
		} catch (err) {
			console.log(`[${type}] [${this.cuid}] ${message}`);
			return null;
		}
	}
}
