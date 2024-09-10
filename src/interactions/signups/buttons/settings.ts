import { ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { Button } from '../../../builders/button';
import { ErrorCode, InteractionError } from '../../../utils/errors';
import { getHydratedSignup } from '../../../db/signups';
import { generalSettingsEmbed } from '../settings/general';

export default new Button('signup-settings')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('⚙')
	.onExecute(async (i) => {
		const canManageChannels = i.memberPermissions?.has(
			PermissionFlagsBits.ManageChannels
		);

		if (!canManageChannels) {
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message:
					'You need to have the "Manage Channels" permission to edit the signups',
			});
		}

		const signup = await getHydratedSignup(i.message.id);
		if (!signup) {
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});
		}

		const { embed, row } = await generalSettingsEmbed(signup);

		await i.reply({
			embeds: [embed],
			components: row.components.length > 0 ? [row] : undefined,
			ephemeral: true,
		});
	});
