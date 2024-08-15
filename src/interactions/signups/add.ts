import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';

export const addUserToSignups = new SubCommand('add')
	.setDescription('Add a user to a category')
	.addStringOption((o) =>
		o
			.setName('category')
			.setDescription('The category to add the user')
			.setRequired(true)
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

		await i.reply({
			content: 'This subcommand is not yet implemented',
			ephemeral: true,
		});
	});
