import type { Interaction } from 'discord.js';
import { CustomButton } from '../../structures/interactions/Button';
import { UserSelectMenu } from '../../structures/interactions/UserSelectMenu';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { Modal } from '@structures/interactions/Modal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function onInteraction(i: Interaction<any>) {
	if (i.isAutocomplete()) {
		const newCmd = SlashCommand.slashCommands.get(i.commandName);
		if (!newCmd) return i.respond([]);
		try {
			return newCmd.runAutoComplete(i);
		} catch (err) {
			console.log(err);
		}
	} else if (i.isChatInputCommand()) {
		const slashCommand = SlashCommand.slashCommands.get(i.commandName);
		if (!slashCommand) return i.reply({ content: 'This command does not exist', ephemeral: true });
		try {
			await slashCommand.run(i);
		} catch (err) {
			console.log(err);
		}
	} else if (i.isButton()) {
		const [customId, data] = CustomButton.getDataFromCustomID(i.customId);
		if (!customId) return;

		const customButton = CustomButton.buttons.get(customId);
		if (!customButton) return i.reply({ content: 'This button does not exist', ephemeral: true });
		try {
			customButton.onExecute(i, data).catch((err) => {
				customButton.onError(i, err);
			});
		} catch (err) {
			customButton.onError(i, err);
		}
	} else if (i.isUserSelectMenu()) {
		const [customId, data] = UserSelectMenu.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = UserSelectMenu.userSelectMenus.get(customId);
		if (!selectInteraction) return i.reply({ content: 'This select menu does not exist', ephemeral: true });
		try {
			selectInteraction.onExecute(i, data).catch((err) => {
				selectInteraction.onError(i, err);
			});
		} catch (err) {
			selectInteraction.onError(i, err);
		}
	} else if (i.isAnySelectMenu()) {
		return i.reply({ content: 'This select menu does not exist', ephemeral: true });
	} else if (i.isModalSubmit()) {
		const [customId, data] = Modal.getDataFromCustomID(i.customId);
		if (!customId) return;

		const modal = Modal.modals.get(customId);
		if (!modal) return i.reply({ content: 'This modal does not exist', ephemeral: true });
		try {
			await modal.run(i, data);
		} catch (err) {
			await modal.onError(i, err);
		}
	}
}
