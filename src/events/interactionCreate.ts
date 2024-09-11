import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
	ModalSubmitInteraction,
} from 'discord.js';
import { SlashCommand } from '../builders/slashCommand';
import { Button } from '../builders/button';
import { parseCustomId } from '../utils/customId';
import { SubCommandHandler } from '../builders/subcommandHandler';
import { Modal } from '../builders/modal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function onInteraction(i: Interaction<any>) {
	switch (true) {
		case i.isChatInputCommand():
			return await handleSlashCommand(i as ChatInputCommandInteraction);
		case i.isAutocomplete():
			return await handleAutocomplete(i as AutocompleteInteraction);
		case i.isButton():
			return await handleButton(i as ButtonInteraction);
		case i.isModalSubmit():
			return await handleModalSubmit(i as ModalSubmitInteraction);
		default:
			if (i.isRepliable()) {
				await i.reply({
					content: 'This interaction type is not supported yet.',
					ephemeral: true,
				});
			} else {
				console.log('Interaction type not supported yet.', i);
			}
			break;
	}
}

async function handleSlashCommand(i: ChatInputCommandInteraction) {
	const slashCommand = SlashCommand.slashCommands.get(i.commandName);
	if (!slashCommand) {
		const subcommandHandler = SubCommandHandler.subcommandHandlers.get(
			i.commandName
		);
		if (!subcommandHandler)
			return i.reply({
				content: 'This command does not exist',
				ephemeral: true,
			});

		return await subcommandHandler.run(i);
	}
	return await slashCommand.run(i);
}

async function handleAutocomplete(i: AutocompleteInteraction) {
	if (i.options.getSubcommand()) {
		const handler = SubCommandHandler.subcommandHandlers.get(i.commandName);
		if (!handler)
			return await i.respond([
				{
					name: 'Invalid Subcommand',
					value: 'Invalid Subcommand',
				},
			]);

		await handler.onAutocomplete(i);
	}
}

async function handleButton(i: ButtonInteraction) {
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
}
async function handleModalSubmit(i: ModalSubmitInteraction) {
	const modal = Modal.modals.get(i.customId);
	if (!modal) {
		return i.reply({
			content: 'This modal does not exist',
			ephemeral: true,
		});
	}
	return await modal.run(i);
}
