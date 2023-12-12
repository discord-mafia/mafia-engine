import {
	ActionRowBuilder,
	TextInputBuilder,
	type CacheType,
	type ModalSubmitInteraction,
	type ModalActionRowComponentBuilder,
	TextInputStyle,
} from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';

export default new Modal('register-citizenship')
	.set((modal) => {
		modal.setTitle('Register Citizenship');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(
			new TextInputBuilder()
				.setCustomId('username')
				.setLabel('What name do you wish to go by?')
				.setPlaceholder('This can only be changed under specific circumstances')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)
		);
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>) => {
		await i.reply({ content: 'Register Citizenship', ephemeral: true });
	});
