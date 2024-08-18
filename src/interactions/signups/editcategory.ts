import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import {
	createCategoryForSignup,
	editCategoryForSignup,
	getSignupByChannel,
} from '../../db/signups';
import { onSignupUpdate } from './signupUpdateEvent';

export default new SubCommand('edit_category')
	.setDescription('Edit an existing category to a signup')
	.addStringOption((o) =>
		o
			.setName('name')
			.setDescription('The name of the new category')
			.setRequired(true)
	)
	.addIntegerOption((o) =>
		o
			.setName('limit')
			.setDescription('Limit of users you wish to have in the category')
	)
	.addStringOption((o) =>
		o
			.setName('new_name')
			.setDescription('The new name you wish the category to have')
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
		const new_limit = i.options.getInteger('limit');
		const new_name = i.options.getString('new_name');

		await i.deferReply({ ephemeral: true });

		const signup = await getSignupByChannel(i.channelId);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		const edit = await editCategoryForSignup(
			i.channelId,
			category_name,
			new_limit,
			new_name
		);

		if (!edit) throw new InteractionError('Failed to edit category');

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
