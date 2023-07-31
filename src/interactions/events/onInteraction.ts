import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { slashCommands } from '../../structures/BotClient';
import { Button, Modal, SelectMenu } from '../../structures/interactions';

export default async function onInteraction(i: Interaction<any>) {
	if (i.isChatInputCommand()) {
		const command = slashCommands.get(i.commandName);
		if (!command) return console.error(`No command matching ${i.commandName} was found.`);
		try {
			command.execute(i as ChatInputCommandInteraction);
		} catch (err) {
			console.log(err);
		}
	} else if (i.isButton()) {
		const [customId, data] = Button.getDataFromCustomID(i.customId);
		if (!customId) return;
		const buttonInteraction = Button.buttons.get(customId);
		if (buttonInteraction) buttonInteraction.execute(i, data);
	} else if (i.isAnySelectMenu()) {
		const [customId, data] = SelectMenu.getDataFromCustomID(i.customId);
		if (!customId) return;
		const selectInteraction = SelectMenu.selectMenus.get(customId);
		if (selectInteraction) selectInteraction.execute(i, data);
	} else if (i.isModalSubmit()) {
		const [customId, data] = Modal.getDataFromCustomID(i.customId);
		if (!customId) return;
		const modalInteraction = Modal.modals.get(customId);
		if (modalInteraction) modalInteraction.execute(i, data);
	}
}
