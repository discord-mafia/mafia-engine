import { ActionRowBuilder, TextInputBuilder, type CacheType, type ModalSubmitInteraction, type ModalActionRowComponentBuilder, TextInputStyle } from 'discord.js';
import { getAnonymousProfile, updateAnonymousProfile } from '../../../models/anonymity';
import { Modal } from '../../../structures/interactions/Modal';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageSpecificProfile } from '../../../views/anonymity';

export default new Modal('anon-set-name')
	.set((modal) => {
		modal.setTitle('Set Name');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('name').setLabel('Name').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('This modal was invalid [ERR01]');

		const profileID = parseInt(cache);
		if (isNaN(profileID)) throw new InteractionError('This model was invalid [ERR02]');

		const name = i.fields.getTextInputValue('name');
		if (!name) throw new InteractionError('No name was provided');
		if (name.trim() == '') throw new InteractionError('No valid name was provided');

		const profile = await getAnonymousProfile(profileID);
		if (!profile) throw new InteractionError('This profile no longer exists');

		const updated = await updateAnonymousProfile(profile.id, {
			name: name.trim(),
		});

		const payload = await anonEmbedManageSpecificProfile(updated);
		return await i.reply({ ...payload, ephemeral: true });
	});
