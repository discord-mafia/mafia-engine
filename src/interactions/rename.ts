import { SlashCommand } from '../builders/slashCommand';
import { ChannelType } from 'discord.js';
import { InteractionError } from '../utils/errors';
import { updateUser } from '../db/users';

export const test = new SlashCommand('rename')
	.addUserOption((o) =>
		o.setName('user').setDescription('The user to rename').setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName('name')
			.setDescription('The new name the use will have')
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

		const requested_user = i.options.getUser('user', true);
		const requested_name = i.options.getString('name', true);

		const updated_user = await updateUser(requested_user.id, {
			username: requested_name,
		});

		if (!updated_user) throw new InteractionError('Failed to update user');

		await i.reply({
			content: `Renamed ${requested_user.username} to ${requested_name}`,
			ephemeral: true,
		});
	});
