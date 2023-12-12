import {
	ActionRowBuilder,
	TextInputBuilder,
	type CacheType,
	type ModalSubmitInteraction,
	type ModalActionRowComponentBuilder,
	TextInputStyle,
} from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';

export default class RegisterCitizenshipModal extends Modal {
	static customId = 'register-citizenship';
	constructor() {
		super(RegisterCitizenshipModal.customId);
	}

	async onExecute(i: ModalSubmitInteraction<CacheType>) {
		await i.reply({ content: 'Register Citizenship', ephemeral: true });
	}
	generateModal() {
		const modal = super.generateModal().setTitle('Register Citizenship');
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
		return modal;
	}
}
