import { ButtonStyle } from 'discord.js';
import { Button } from '../builders/button';
import { SlashCommand } from '../builders/slashCommand';

export const test = new SlashCommand('test').onExecute(async (i) => {
	const btn = button.buildAsRow();
	await i.reply({
		content: 'Hello World!',
		components: [btn],
		ephemeral: true,
	});
});

export const button = new Button('test')
	.setStyle(ButtonStyle.Primary)
	.onExecute(async (i) => {
		await i.reply({ content: 'Hello World!', ephemeral: true });
	});
