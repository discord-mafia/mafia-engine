import { type UserSelectMenuInteraction, type CacheType } from 'discord.js';
import { getSignup } from '@models/signups';
import { prisma } from 'index';
import { UserSelectMenu } from 'structures/interactions/UserSelectMenu';
import { InteractionError } from 'structures/interactions';
import { formatSignupEmbed } from '@views/signups';

export default class SignupRemovePlayerMenu extends UserSelectMenu {
	static customId = 'remove-user-from-signup';
	constructor() {
		super(SignupRemovePlayerMenu.customId);
	}

	async onExecute(i: UserSelectMenuInteraction<CacheType>, cache?: string) {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('This command is invalid as it has no valid cache attached');

		const values = i.values;
		const messageId = cache;

		await i.deferReply({ ephemeral: true });

		const signup = await getSignup({ messageId });
		if (!signup) return i.reply({ content: 'This select menu is invalid', ephemeral: true });

		const allCategoryIds = signup.categories.map((x) => x.id);

		await prisma.signupUserJunction.deleteMany({
			where: {
				signupCategoryId: {
					in: allCategoryIds,
				},
				user: {
					discordId: {
						in: values,
					},
				},
			},
		});

		const signupMessage = await i.channel.messages.fetch(messageId);
		if (!signupMessage) return i.editReply({ content: 'Failed to fetch signup message but the players are removed' });

		const reset = await getSignup({ messageId });
		if (!reset) return i.editReply({ content: 'This button failed' });
		const { embed, row } = formatSignupEmbed(reset);

		signupMessage.edit({ embeds: [embed], components: [row] });

		await i.editReply({ content: 'Removed users from signup' });
	}

	generateUserSelectMenu(messageId: string) {
		return super.generateUserSelectMenu(messageId).setMaxValues(20).setMinValues(1).setPlaceholder('Players to remove from the signup');
	}
}
