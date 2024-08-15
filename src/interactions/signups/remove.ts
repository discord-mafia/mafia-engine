import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import {
	getHydratedSignup,
	getSignupByChannel,
	removeUserFromCategory,
} from '../../db/signups';
import { formatSignupEmbed, formatSignupComponents } from '../../views/signup';

export const removeUserFromSignups = new SubCommand('remove')
	.setDescription('Remove a user from a category')
	.addStringOption((o) =>
		o
			.setName('category')
			.setDescription('The category to remove the user from')
			.setRequired(true)
	)
	.addUserOption((o) =>
		o
			.setName('user')
			.setDescription('The user to remove from the category')
			.setRequired(true)
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
		const user = i.options.getUser('user');
		if (!category || !user)
			throw new InteractionError(
				'You must provide both a category and a user'
			);

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
	});
