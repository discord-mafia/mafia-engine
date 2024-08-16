import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import {
	getCategoryNames,
	getCategoryUsersByCategoryName,
	getUserNames,
} from '../../db/signups';
import { trigramSimilarity } from '../../utils/string';

export const getInfoFromCategory = new SubCommand('info')
	.setDescription('View info of a category')
	.addStringOption((o) =>
		o
			.setName('category')
			.setDescription('The category to remove the user from')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.onExecute(async (i) => {
		if (!i.guild)
			throw new InteractionError(
				'Cannot use this command outside of a server'
			);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(
				'Cannot use this command outside of a text channel'
			);

		const cat = i.options.getString('category', true);
		const users = await getCategoryUsersByCategoryName(i.channelId, cat);

		let content = '```yaml\n';

		for (const user of users) {
			content += `${user.username}: <@${user.id}>\n`;
		}

		content += '```';

		await i.reply({
			content,
			ephemeral: true,
		});
	})
	.onAutocomplete(async (i) => {
		const { name, value } = i.options.getFocused(true);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			return await i.respond([]);

		switch (name) {
			case 'category': {
				const categoryNames = await getCategoryNames(i.channelId);
				if (categoryNames.length == 0) return await i.respond([]);

				const list = trigramSimilarity(value, categoryNames, 5);
				if (list.length == 0) return await i.respond([]);

				return await i.respond(
					list.map((c) => {
						return { name: c.str, value: c.str };
					})
				);
			}
			case 'user': {
				let userNames = await getUserNames(i.channelId);
				if (userNames.length == 0) return await i.respond([]);

				const seen = new Set();
				userNames = userNames.filter((u) => {
					if (seen.has(u)) return false;
					seen.add(u);
					return true;
				});

				const list = trigramSimilarity(value, userNames, 5);
				if (list.length == 0) return await i.respond([]);

				return await i.respond(
					list.map((c) => {
						return { name: c.str, value: c.str };
					})
				);
			}
			default: {
				return await i.respond([]);
			}
		}
	});
