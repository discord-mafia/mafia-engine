import type { Interaction } from 'discord.js';
import { SlashCommand } from '../builders/slashCommand';

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
	}
}
