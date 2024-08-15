import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';

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

		await i.reply({
			content: 'This subcommand is not yet implemented',
			ephemeral: true,
		});
	});
