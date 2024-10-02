import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../../builders/modal';
import { ErrorCode, InteractionError } from '../../../utils/errors';
import { getSignupByChannel, updateSignupName } from '../../../db/signups';
import { onSignupUpdate } from '../signupUpdateEvent';

export const changeSignupTitle = new Modal('change-signup-title')
	.setCustomId('change-signup-title')
	.setTitle('Change Signup Title')
	.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setLabel('New Title')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)
				.setCustomId('title')
				.setMinLength(1)
				.setMaxLength(256)
		)
	)
	.onExecute(async (i) => {
		if (!i.channel)
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message: 'This modal can only be used in a channel',
			});

		await i.deferReply({ ephemeral: true });

		const newName = i.fields.getTextInputValue('title');
		if (!newName)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must provide a new name for the signup',
			});

		const signup = await getSignupByChannel(i.channel.id);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		await updateSignupName(signup.id, newName);

		const msg = await i.channel.messages.fetch(signup.messageId);
		if (!msg) throw new InteractionError('Failed to fetch message');

		await onSignupUpdate.publish({
			message: msg,
			messageId: signup.messageId,
		});

		await i.deleteReply();
	});
