import { SlashCommand } from '@structures/interactions/SlashCommand';
import RegisterCitizenshipModal from '../modals/registerCitizenship';

export default new SlashCommand('test').setRequiresCitizenship(true).onExecute(async (i, ctx) => {
	if (!ctx.citizenship) {
		const modal = RegisterCitizenshipModal.getModalBuilder();
		return await i.showModal(modal);
	}
	return await i.reply({ content: 'You already have citizenship', ephemeral: true });
});
