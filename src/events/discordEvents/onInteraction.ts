import type { Interaction } from 'discord.js';
import { Button, SelectMenu } from '../../structures/interactions';
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
		// Check new Buttons first
		const [customId, data] = CustomButton.getDataFromCustomID(i.customId);
		if (!customId) return;

		const customButton = CustomButton.buttons.get(customId);
		if (customButton)
			try {
				customButton.onExecute(i, data).catch((err) => {
					customButton.onError(i, err);
				});
			} catch (err) {
				customButton.onError(i, err);
			}
		else {
			const buttonInteraction = Button.buttons.get(customId);
			if (buttonInteraction) buttonInteraction.execute(i, data);
		}
	} else if (i.isUserSelectMenu()) {
		const [customId, data] = UserSelectMenu.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = UserSelectMenu.userSelectMenus.get(customId);
		if (selectInteraction)
			try {
				selectInteraction.onExecute(i, data).catch((err) => {
					selectInteraction.onError(i, err);
				});
			} catch (err) {
				selectInteraction.onError(i, err);
			}
		else {
			const newSelct = SelectMenu.selectMenus.get(customId);
			if (newSelct) newSelct.execute(i, data);
		}
	} else if (i.isAnySelectMenu()) {
		const [customId, data] = SelectMenu.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = SelectMenu.selectMenus.get(customId);
		if (selectInteraction) selectInteraction.execute(i, data);
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
