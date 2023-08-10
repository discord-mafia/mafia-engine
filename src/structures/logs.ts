import { AttachmentBuilder, ColorResolvable, Colors, RGBTuple, WebhookClient } from 'discord.js';
import config from '../config';
import { EmbedBuilder } from '@discordjs/builders';

export enum LogType {
	Error = 'Error',
	Info = 'Info',
}

interface BaseLog {
	type: LogType;
	message: string;
	file?: Buffer;
	timestamp: Date;
	color: number | RGBTuple | null;
}

export async function sendLog(log: BaseLog) {
	const webhookURL = config.LOG_WEBHOOK_URL;
	if (!webhookURL) return console.log(`[${log.type.toUpperCase()} - ${log.timestamp}] ${log.message}`);

	try {
		const webhook = new WebhookClient({ url: webhookURL });

		const embed = new EmbedBuilder();
		embed.setTitle(`Log: ${log.type}`);
		embed.setColor(log.type == LogType.Error ? Colors.Red : Colors.White);
		if (log.color) embed.setColor(log.color);
		embed.setDescription(log.message);
		embed.setTimestamp(log.timestamp);

		const attachment = log.file ? new AttachmentBuilder(log.file).setName('data.txt') : undefined;

		return webhook.send({ embeds: [embed], files: attachment ? [attachment] : undefined });
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function sendInfoLog(message: string, customColor: number | RGBTuple | null = Colors.White) {
	return sendLog({
		type: LogType.Info,
		message,
		timestamp: new Date(),
		color: customColor,
	});
}

export async function sendErrorLog(message: string, error?: unknown) {
	const errorStr = convertToString(error);
	const buffer = errorStr ? Buffer.from(errorStr, 'utf-8') : undefined;

	return sendLog({
		type: LogType.Error,
		message,
		file: buffer,
		timestamp: new Date(),
		color: Colors.Red,
	});
}

export function convertToString(anyValue: unknown) {
	if (typeof anyValue === 'string') return anyValue;
	if (typeof anyValue === 'number') return anyValue.toString();
	if (typeof anyValue === 'boolean') return anyValue.toString();
	if (typeof anyValue === 'bigint') return anyValue.toString();
	if (typeof anyValue === 'symbol') return anyValue.toString();
	if (typeof anyValue === 'undefined') return 'undefined';
	if (typeof anyValue === 'function') return 'function';
	if (typeof anyValue === 'object') return JSON.stringify(anyValue, null, 2);

	return undefined;
}
