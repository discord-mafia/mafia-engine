import { ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { Button } from '../../../builders/button';
import { ErrorCode, InteractionError } from '../../../utils/errors';

export default new Button('signup-settings')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('⚙')
	.onExecute(async (i) => {
		const canManageChannels = i.memberPermissions?.has(
			PermissionFlagsBits.ManageChannels
		);

		throw new InteractionError({
			status: ErrorCode.NotPermitted,
			message:
				'You need to have the "Manage Channels" permission to edit the signups',
		});

		await i.reply({
			content: 'This button has not been implemented yet.',
			ephemeral: true,
		});
	});
