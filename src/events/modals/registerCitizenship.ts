import { ActionRowBuilder, TextInputBuilder, type CacheType, type ModalSubmitInteraction, type ModalActionRowComponentBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';
import { prisma } from '../..';
import { getUserById } from '../../models/users';

export default new Modal('register-citizenship')
	.set((modal) => {
		modal.setTitle('Register Citizenship');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('username').setLabel('What name do you wish to go by?').setPlaceholder('This can only be changed under specific circumstances').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>) => {
		const username = i.fields.getTextInputValue('username');
		if (!username) return i.reply({ content: 'You must provide a username when registering!', ephemeral: true });

		const user = await getUserById(i.user.id);
		if (user) if (user.isRegistered) return i.reply({ content: 'You are already registered!', ephemeral: true });

		try {
			if (user) {
				await prisma.user.update({
					where: { discordId: user.discordId },
					data: {
						username,
						isRegistered: true,
					},
				});
			} else {
				await prisma.user.create({
					data: {
						discordId: i.user.id,
						username,
						isRegistered: true,
					},
				});
			}

			return i.reply({
				content: 'You have successfully registered! If you were trying to interact with the bot, please try again now that you are registered.',
				ephemeral: true,
			});
		} catch (err) {
			console.error(err);
			return i.reply({ content: 'An error occurred when registering!', ephemeral: true });
		}
	});
