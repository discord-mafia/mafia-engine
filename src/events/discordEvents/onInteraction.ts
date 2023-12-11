import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { Button, Modal, SelectMenu } from '../../structures/interactions';
import { CustomButton } from '../../structures/interactions/Button';
import { UserSelectMenu } from '../../structures/interactions/UserSelectMenu';
import { Modal as NewModal } from '../../structures/interactions/Modal';
import { getSlashCommand } from '@structures/interactions/OldSlashCommand';
import { SlashCommand } from '@structures/interactions/SlashCommand';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function onInteraction(i: Interaction<any>) {
	if (i.isAutocomplete()) {
		const command = getSlashCommand(i.commandName);
		if (!command) return console.error(`No command matching ${i.commandName} was found.`);
		if (!command.autocomplete) return;
		try {
			return command.autocomplete(i);
		} catch (err) {
			console.log(err);
		}
	} else if (i.isChatInputCommand()) {
		const newCmd = SlashCommand.slashCommands.get(i.commandName);
		if (newCmd) {
			try {
				await newCmd.run(i as ChatInputCommandInteraction);
			} catch (err) {
				console.log(err);
			}
		} else {
			const command = getSlashCommand(i.commandName);
			if (!command) return console.error(`No command matching ${i.commandName} was found.`);
			try {
				command.execute(i as ChatInputCommandInteraction);
			} catch (err) {
				console.log(err);
			}
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

		const modal = NewModal.modals.get(customId);
		if (!modal) {
			const modalInteraction = Modal.modals.get(customId);
			if (modalInteraction) modalInteraction.execute(i, data);
		} else {
			try {
				modal.onExecute(i, data).catch((err) => {
					modal.onError(i, err);
				});
			} catch (err) {
				modal.onError(i, err);
			}
		}
	}
}
