import { ChannelType, Interaction, Message } from 'discord.js';
import { getHydratedSignup } from '../../db/signups';
import { formatSignupEmbed, formatSignupComponents } from '../../views/signup';
import { Event } from '../../builders/event';
import { client } from '../../controllers/discord';
export type SignupUpdateEvent =
	| { messageId: string; i: Interaction }
	| { messageId: string; message: Message }
	| { signupId: number };

export const onSignupUpdate = new Event<SignupUpdateEvent>().subscribe(
	async (data) => {
		if ('messageId' in data) {
			const hydratedSignup = await getHydratedSignup({
				messageId: data.messageId,
			});
			if (!hydratedSignup) return;

			const embed = formatSignupEmbed(hydratedSignup);
			const components = formatSignupComponents(hydratedSignup);

			if ('i' in data) {
				if (data.i.isButton())
					return await data.i.update({
						embeds: [embed],
						components: [components],
					});
				else if (data.i.isChatInputCommand()) {
					return await data.i.editReply({
						embeds: [embed],
						components: [components],
					});
				}
				return;
			}

			await data.message.edit({
				embeds: [embed],
				components: [components],
			});
		} else {
			const signup = await getHydratedSignup({
				signupId: data.signupId,
			});
			if (!signup) return;

			const guild = await client.guilds.fetch(signup.guildId);
			if (!guild) return;

			const channel = await guild.channels.fetch(signup.channelId);
			if (!channel || channel.type != ChannelType.GuildText) return;

			const msg = await channel.messages.fetch(signup.messageId);
			if (!msg) return;

			const embed = formatSignupEmbed(signup);
			const components = formatSignupComponents(signup);

			await msg.edit({ embeds: [embed], components: [components] });
		}
	}
);
