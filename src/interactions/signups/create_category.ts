import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import { createCategoryForSignup, getSignupByChannel } from '../../db/signups';
import { onSignupUpdate } from './signupUpdateEvent';

export default new SubCommand('create_category')
	.setDescription('Add a new category to a signup')
	.addStringOption((o) =>
		o
			.setName('name')
			.setDescription('The name of the new category')
			.setRequired(true)
	)
	.addStringOption((o) =>
		o.setName('button_name').setDescription('The button name')
	)
	.addIntegerOption((o) =>
		o
			.setName('limit')
			.setDescription('Limit of users you wish to have in the category')
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
		const button_name = i.options.getString('buttonName');
		const limit = i.options.getInteger('limit');

		await i.deferReply({ ephemeral: true });

		const signup = await getSignupByChannel(i.channelId);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		await createCategoryForSignup(i.channelId, {
			name: category_name,
			limit,
			buttonName: button_name,
			signupId: signup.id,
		});

		const msg = await i.channel.messages.fetch(signup.messageId);
		if (!msg) throw new InteractionError('Failed to fetch message');

		await onSignupUpdate.publish({
			messageId: signup.messageId,
			message: msg,
		});

		await i.editReply({
			content: 'Created category',
		});
	});
