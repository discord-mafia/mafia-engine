import { EmbedBuilder, WebhookClient } from 'discord.js';
import config from '../config';

export enum LogType {
	JOIN,
	LEAVE,
}
interface LogOptions {
	user: string;
	channelId: string;
	categoryName?: string;
	type: LogType;
}
export async function logSignup(options: LogOptions) {
	if (!config.TMP_SIGNUP_LOG_WEBHOOK) return;

	const webhook = new WebhookClient({
		url: config.TMP_SIGNUP_LOG_WEBHOOK,
	});

	const embed = new EmbedBuilder();
	embed.setTitle('Signup Log');
	embed.setDescription(
		`**${options.user}** ${
			options.type == LogType.JOIN ? 'joined' : 'left'
		}${options.categoryName ? ' ' + options.categoryName : ''}`
	);
	embed.addFields({ name: 'Channel', value: `<#${options.channelId}>` });
	embed.setTimestamp(new Date());

	if (options.type == LogType.JOIN) embed.setColor('Green');
	else embed.setColor('Red');

	webhook.send({
		embeds: [embed],
	});
}
