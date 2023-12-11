import { LogType } from '@utils/logger';
import { type ColorResolvable, Colors, EmbedBuilder } from 'discord.js';

export function genLoggerEmbed(cuid: string, type: LogType, message: string, color?: ColorResolvable) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Logger - ${type}`);
	embed.setColor(color ? color : type == LogType.Error ? Colors.Red : Colors.White);
	embed.setDescription(message);
	embed.setTimestamp(new Date());
	embed.setFooter({
		text: `ID: ${cuid}`,
	});
	return embed;
}
