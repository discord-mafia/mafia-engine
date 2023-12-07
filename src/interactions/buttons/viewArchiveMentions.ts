import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Button } from '../../structures/interactions';
import { getArchive } from '@models/automaticGames';

export default new Button('view-archive-mentions')
	.setButton(new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger))
	.onExecute(async (i, cache) => {
		if (!cache) return i.reply({ content: 'This button is invalid', ephemeral: true });
		if (!i.guild) return;

		const archive = await getArchive(cache);
		if (!archive) return i.reply({ content: 'This button is invalid', ephemeral: true });

		const embed = new EmbedBuilder();
		embed.setTitle('Archive Mentions');
		embed.setColor('White');
		const hostList = archive.users
			.filter((user) => user.isHost)
			.map((v) => `- <@${v.user.discordId}> (${v.user.username})`)
			.join('\n');
		if (hostList.length > 0) embed.addFields({ name: 'Hosts', value: hostList });

		const coHostList = archive.users
			.filter((user) => user.isCoHost)
			.map((v) => `- <@${v.user.discordId}> (${v.user.username})`)
			.join('\n');
		if (coHostList.length > 0) embed.addFields({ name: 'Co-Hosts', value: coHostList });

		const winnerListFormat = new Map<string, string[]>();
		archive.users
			.filter((user) => user.isWinner)
			.forEach((v) => {
				if (v.role && v.alignment) {
					if (!winnerListFormat.get(v.alignment)) winnerListFormat.set(v.alignment, []);
					winnerListFormat.get(v.alignment)?.push(` - <@${v.user.discordId}> (${v.user.username}) as ${v.role}`);
				}
			});
		if (winnerListFormat.size > 0) {
			embed.addFields({
				name: 'Winners',
				value: Array.from(winnerListFormat.entries())
					.map(([k, v]) => {
						return `- **${k}**\n${v.join('\n')}`;
					})
					.join('\n'),
			});
		}

		const loserListFormat = new Map<string, string[]>();
		archive.users
			.filter((user) => user.isLoser)
			.forEach((v) => {
				if (v.role && v.alignment) {
					if (!loserListFormat.get(v.alignment)) loserListFormat.set(v.alignment, []);
					loserListFormat.get(v.alignment)?.push(` - <@${v.user.discordId}> (${v.user.username}) as ${v.role}`);
				}
			});
		if (loserListFormat.size > 0) {
			embed.addFields({
				name: 'Losers',
				value: Array.from(loserListFormat.entries())
					.map(([k, v]) => {
						return `- **${k}**\n${v.join('\n')}`;
					})
					.join('\n'),
			});
		}
		return i.reply({ embeds: [embed], ephemeral: true });
	});
