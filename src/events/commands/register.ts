import { SlashCommand } from '@structures/interactions/SlashCommand';
import registerCitizenship from '../modals/registerCitizenship';

export default new SlashCommand('register')
	.setDescription('Register for citizenship in Discord Mafia!')
	.setRequiresCitizenship(false)
	.onExecute(async (i, ctx) => {
		if (ctx.citizenship) return i.reply({ content: 'You are already registered!', ephemeral: true });
		const registerModal = registerCitizenship.getModalBuilder();
		return await i.showModal(registerModal);
	});
