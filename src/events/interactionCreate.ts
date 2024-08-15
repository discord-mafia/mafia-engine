import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { SlashCommand } from '../builders/slashCommand';
import { Button } from '../builders/button';
import { parseCustomId } from '../utils/customId';
import { SubCommandHandler } from '../builders/subcommandHandler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function onInteraction(i: Interaction<any>) {
	try {
		if (i.isChatInputCommand()) {
			handleSlashCommand(i);
		} else if (i.isButton()) {
			const parsedCustomID = parseCustomId(i.customId);
			const button = Button.buttons.get(parsedCustomID.custom_id);
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
	} catch (err) {
		let message = 'An error occurred while executing this command.';
		if (err instanceof Error) {
			message = err.message;
		}
		if (!i.isRepliable()) return;
		if (i.deferred || i.replied)
			return await i.editReply({
				content: message,
			});
		return await i.reply({
			content: message,
			ephemeral: true,
		});
	}
}

async function handleSlashCommand(i: ChatInputCommandInteraction) {
	try {
		if (i.options.getSubcommand()) {
			const handler = SubCommandHandler.subcommandHandlers.get(
				i.commandName
			);
			if (!handler)
				return i.reply({
					content: 'This command does not exist',
					ephemeral: true,
				});

			return await handler.run(i);
		}

		const slashCommand = SlashCommand.slashCommands.get(i.commandName);
		if (!slashCommand)
			return i.reply({
				content: 'This command does not exist',
				ephemeral: true,
			});

		return await slashCommand.run(i);
	} catch (err) {
		let message = 'An error occurred while executing this command.';
		if (err instanceof Error) {
			message = err.message;
		}

		if (!i.isRepliable()) return;
		if (i.deferred || i.replied)
			return await i.editReply({
				content: message,
			});
		return await i.reply({
			content: message,
			ephemeral: true,
		});
	}
}
