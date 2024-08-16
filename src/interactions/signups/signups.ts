import { ButtonInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createSignup } from './create';
import { addUserToSignups } from './add';
import { removeUserFromSignups } from './remove';
import { Event } from '../../builders/event';
import { getHydratedSignup } from '../../db/signups';
import { formatSignupComponents, formatSignupEmbed } from '../../views/signup';
import { Button } from '../../builders/button';

export const signups = new SubCommandHandler('signups')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createSignup)
	.attachSubcommand(addUserToSignups)
	.attachSubcommand(removeUserFromSignups);

export type SignupUpdateEvent =
	| { messageId: string; i: ButtonInteraction }
	| { messageId: string; message: Message };

export const onSignupUpdate = new Event<SignupUpdateEvent>().subscribe(
	async (data) => {
		const hydratedSignup = await getHydratedSignup(data.messageId);
		if (!hydratedSignup) return;

		const embed = formatSignupEmbed(hydratedSignup);
		const components = formatSignupComponents(hydratedSignup);

		if ('i' in data) {
			await data.i.update({ embeds: [embed], components: [components] });
			return;
		}

		await data.message.edit({ embeds: [embed], components: [components] });
	}
);
