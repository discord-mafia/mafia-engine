import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { SlashCommand } from '../builders/slashCommand';
import { Button } from '../builders/button';
import { SubCommandHandler } from '../builders/subcommandHandler';
import { Modal } from '../builders/modal';
import { TextSelectMenu } from '../builders/textSelectMenu';
import { CustomId } from '../utils/customId';

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
		case i.isStringSelectMenu():
			return await handleTextSelectMenu(i as StringSelectMenuInteraction);
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
	const customId = CustomId.parseString(i.customId);
	const button = Button.buttons.get(customId.getId());
	if (!button)
		return i.reply({
			content: 'This button does not exist',
			ephemeral: true,
		});
	try {
		await button.run(i, customId.getContext());
	} catch (err) {
		console.log(err);
	}
}
async function handleModalSubmit(i: ModalSubmitInteraction) {
	const customId = CustomId.parseString(i.customId);
	const modal = Modal.modals.get(customId.getId());
	if (!modal) {
		return i.reply({
			content: 'This modal does not exist',
			ephemeral: true,
		});
	}
	return await modal.run(i, customId.getContext());
}

async function handleTextSelectMenu(i: StringSelectMenuInteraction) {
	const customId = CustomId.parseString(i.customId);
	const selectMenu = TextSelectMenu.textSelectMenus.get(customId.getId());
	if (!selectMenu) {
		return i.reply({
			content: 'This select menu does not exist',
			ephemeral: true,
		});
	}
	await selectMenu.run(i, customId.getContext());
}
