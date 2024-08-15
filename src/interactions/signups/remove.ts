import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import {
	getCategoryNames,
	getHydratedSignup,
	getSignupByChannel,
	getUserNames,
	removeUserFromCategory,
} from '../../db/signups';
import { formatSignupEmbed, formatSignupComponents } from '../../views/signup';
import { getUserByName } from '../../db/users';
import { trigramSimilarity } from '../../utils/string';

export const removeUserFromSignups = new SubCommand('remove')
	.setDescription('Remove a user from a category')
	.addStringOption((o) =>
		o
			.setName('category')
			.setDescription('The category to remove the user from')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption((o) =>
		o
			.setName('user')
			.setDescription(
				'The username of the user to remove from the category'
			)
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

		const category = i.options.getString('category');
		const raw_user = i.options.getString('user');
		if (!category || !raw_user)
			throw new InteractionError(
				'You must provide both a category and a user'
			);

		const user = await getUserByName(raw_user);
		if (!user) throw new InteractionError('User not found');

		const res = await removeUserFromCategory(
			user.id,
			i.channel.id,
			category
		);
		if (!res)
			throw new InteractionError('Failed to remove user from category');
		const signup = await getSignupByChannel(i.channel.id);
		if (!signup) throw new InteractionError('Failed to fetch signup');
		const hydrated = await getHydratedSignup(signup.messageId);
		if (!hydrated) throw new InteractionError('Failed to hydrate signup');

		const embed = formatSignupEmbed(hydrated);
		const components = formatSignupComponents(hydrated);

		const msg = await i.channel.messages.fetch(signup.messageId);

		await msg.edit({ embeds: [embed], components: [components] });
		await i.reply({
			content: 'Removed user from category',
			ephemeral: true,
		});
	})
	.onAutocomplete(async (i) => {
		const { name, value } = i.options.getFocused(true);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			return await i.respond([]);

		const signup = await getSignupByChannel(i.channel.id);
		if (!signup) return await i.respond([]);

		switch (name) {
			case 'category': {
				const categoryNames = await getCategoryNames(signup.id);
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
				const userNames = await getUserNames(signup.id);
				if (userNames.length == 0) return await i.respond([]);

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
