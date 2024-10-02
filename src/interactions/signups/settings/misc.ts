import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { Button } from '../../../builders/button';
import {
	getHydratedSignupFromChannel,
	HydratedSignup,
	setSignupAnonymity,
} from '../../../db/signups';
import { signupSettingsHome } from './general';
import { InteractionError, ErrorCode } from '../../../utils/errors';
import { onSignupUpdate } from '../signupUpdateEvent';
import { changeSignupTitle } from './changeTitle';

export const editSignupName = new Button('signup-edit-title')
	.setLabel('Change Name')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.showModal(changeSignupTitle);
	});

export const toggleAnonymity = new Button('signup-edit-anonymity')
	.setLabel('Toggle Anonymity')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		if (!i.channel)
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message: 'This button can only be used in a channel',
			});
		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		await setSignupAnonymity(i.channelId, !signup.isAnonymous);

		signup.isAnonymous = !signup.isAnonymous;
		const { embed, row } = await generalMiscEmbed(signup);
		await i.update({ embeds: [embed], components: [row] });

		const msg = await i.channel.messages.fetch(signup.messageId);
		if (!msg) throw new InteractionError('Failed to fetch message');

		await onSignupUpdate.publish({
			message: msg,
			messageId: signup.messageId,
		});
	});

export async function generalMiscEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Misc - ${signup.name}`);
	embed.setColor('White');

	embed.setDescription('Manage assorted misc settings with this signup');

	embed.addFields({
		name: 'Anonymity',
		value: `> ${signup.isAnonymous ? 'Enabled' : 'Disabled'}`,
		inline: true,
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(signupSettingsHome.build());
	row.addComponents(editSignupName.build());

	const toggleAnon = toggleAnonymity.build();
	toggleAnon.setEmoji(signup.isAnonymous ? '🔳' : '⬜');
	row.addComponents(toggleAnon);

	return {
		embed,
		row,
	};
}
