import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('test').setRequiresCitizenship(true).onExecute(async (i, ctx) => {
	if (!ctx.citizenship) return i.reply({ content: 'You are not a citizen', ephemeral: true });
	await i.reply({ content: 'You are a citizen', ephemeral: true });
});
