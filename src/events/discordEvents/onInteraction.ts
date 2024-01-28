import type { Interaction } from 'discord.js';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { Modal } from '@structures/interactions/Modal';
import { CustomButtonBuilder } from '@structures/interactions/Button';
import { Interaction as CustomInteraction, InteractionError } from '@structures/interactions/_Interaction';
import { CustomUserSelectMenuBuilder } from '@structures/interactions/UserSelectMenu';
import { CustomChannelSelectMenu } from '@structures/interactions/ChannelSelectMenu';
import { CustomStringSelectMenu } from '@structures/interactions/StringSelectMenu';

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
		const [customId, data] = CustomInteraction.getDataFromCustomID(i.customId);
		if (!customId) return;

		const customButton = CustomButtonBuilder.buttons.get(customId);
		if (!customButton) return i.reply({ content: 'This button does not exist', ephemeral: true });
		try {
			if (!customButton.executeFunc) throw new InteractionError('This button has no functionality');
			customButton.executeFunc(i, data).catch((err) => {
				customButton.onError(i, err);
			});
		} catch (err) {
			customButton.onError(i, err);
		}
	} else if (i.isUserSelectMenu()) {
		const [customId, data] = CustomInteraction.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = CustomUserSelectMenuBuilder.userSelectMenus.get(customId);
		if (!selectInteraction) return i.reply({ content: 'This select menu does not exist', ephemeral: true });
		try {
			if (!selectInteraction.executeFunc) throw new InteractionError('This select menu has no functionality');
			selectInteraction.executeFunc(i, data).catch((err) => {
				selectInteraction.onError(i, err);
			});
		} catch (err) {
			selectInteraction.onError(i, err);
		}
	} else if (i.isChannelSelectMenu()) {
		const [customId, data] = CustomInteraction.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = CustomChannelSelectMenu.selectMenus.get(customId);
		if (!selectInteraction) return i.reply({ content: 'This select menu does not exist', ephemeral: true });
		try {
			if (!selectInteraction.executeFunc) throw new InteractionError('This select menu has no functionality');
			selectInteraction.executeFunc(i, data).catch((err) => {
				selectInteraction.onError(i, err);
			});
		} catch (err) {
			selectInteraction.onError(i, err);
		}
	} else if (i.isStringSelectMenu()) {
		const [customId, data] = CustomInteraction.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = CustomStringSelectMenu.selectMenus.get(customId);
		if (!selectInteraction) return i.reply({ content: 'This select menu does not exist', ephemeral: true });
		try {
			if (!selectInteraction.executeFunc) throw new InteractionError('This select menu has no functionality');
			selectInteraction.executeFunc(i, data).catch((err) => {
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
