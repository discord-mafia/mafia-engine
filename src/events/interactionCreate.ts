import type { Interaction } from 'discord.js';
import { SlashCommand } from '../builders/slashCommand';
import { Button } from '../builders/button';
import { parseCustomId } from '../utils/customId';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function onInteraction(i: Interaction<any>) {
	if (i.isChatInputCommand()) {
		const slashCommand = SlashCommand.slashCommands.get(i.commandName);
		if (!slashCommand)
			return i.reply({
				content: 'This command does not exist',
				ephemeral: true,
			});
		try {
			await slashCommand.run(i);
		} catch (err) {
			console.log(err);
		}
	} else if (i.isButton()) {
		const button = Button.buttons.get(i.customId);
		if (!button)
			return i.reply({
				content: 'This button does not exist',
				ephemeral: true,
			});
		try {
			const ctx = parseCustomId(i.customId);
			await button.run(i, ctx.context);
		} catch (err) {
			console.log(err);
		}
	} else {
		if (i.isRepliable()) {
			await i.reply({
				content: 'This interaction type is not supported yet.',
				ephemeral: true,
			});
		} else {
			console.log('Interaction type not supported yet.', i);
		}
	}
}
