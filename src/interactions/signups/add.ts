import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import {
	forceAddUserToCategory,
	getCategoryNames,
	getSignupByChannel,
} from '../../db/signups';
import { getOrInsertUser } from '../../db/users';
import { trigramSimilarity } from '../../utils/string';
import { onSignupUpdate } from './signups';

export const addUserToSignups = new SubCommand('add')
	.setDescription('Add a user to a category')
	.addStringOption((o) =>
		o
			.setName('category')
			.setDescription('The category to add the user')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addUserOption((o) =>
		o
			.setName('user')
			.setDescription('The user to add to the category')
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

		const created_user = await getOrInsertUser({
			id: user.id,
			username: user.username,
		});
		if (!created_user) throw new InteractionError('Failed to create user');
		const res = await forceAddUserToCategory(
			created_user?.id,
			i.channel.id,
			category
		);
		if (!res) throw new InteractionError('Failed to add user to category');
		const signup = await getSignupByChannel(i.channel.id);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		const msg = await i.channel.messages.fetch(signup.messageId);
		await onSignupUpdate.publish({
			messageId: msg.id,
			message: msg,
		});

		await i.reply({
			content: 'Added user to category',
			ephemeral: true,
		});
	})
	.onAutocomplete(async (i) => {
		const { value } = i.options.getFocused(true);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			return await i.respond([]);

		const categoryNames = await getCategoryNames(i.channelId);
		if (categoryNames.length == 0) return await i.respond([]);

		const list = trigramSimilarity(value, categoryNames, 5);
		if (list.length == 0) return await i.respond([]);

		return await i.respond(
			list.map((c) => {
				return { name: c.str, value: c.str };
			})
		);
	});
