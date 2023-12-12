import { SlashCommand } from '@structures/interactions/SlashCommand';
import RegisterCitizenshipModal from '../modals/registerCitizenship';

export default new SlashCommand('test').setRequiresCitizenship(true).onExecute(async (i, ctx) => {
	if (!ctx.citizenship) {
		const modal = RegisterCitizenshipModal.getModalOrThrow(RegisterCitizenshipModal.customId);
		return await i.showModal(modal.generateModal());
	}
	await i.reply({ content: 'You are a citizen', ephemeral: true });
});
