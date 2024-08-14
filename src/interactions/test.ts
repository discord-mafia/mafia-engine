import { SlashCommand } from '../builders/slashCommand';

export const test = new SlashCommand('test').onExecute(async (i) => {
	await i.reply({ content: 'Hello World!', ephemeral: true });
});
