import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import { deleteCategoryFromSignup, getSignupByChannel } from '../../db/signups';
import { onSignupUpdate } from './signupUpdateEvent';

export default new SubCommand('delete_category')
	.setDescription('Remove a category to a signup')
	.addStringOption((o) =>
		o
			.setName('name')
			.setDescription('The name of the category')
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

		const category_name = i.options.getString('name', true);

		await i.deferReply({ ephemeral: true });

		const signup = await getSignupByChannel(i.channelId);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		await deleteCategoryFromSignup(i.channelId, category_name);

		const msg = await i.channel.messages.fetch(signup.messageId);
		if (!msg) throw new InteractionError('Failed to fetch message');

		await onSignupUpdate.publish({
			messageId: signup.messageId,
			message: msg,
		});

		await i.editReply({
			content: 'Deleted category',
		});
	});
