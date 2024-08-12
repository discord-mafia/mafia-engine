import { ActionRowBuilder, TextInputBuilder, type CacheType, type ModalSubmitInteraction, type ModalActionRowComponentBuilder, TextInputStyle } from 'discord.js';

import { z } from 'zod';
import { getAnonymousProfile, updateAnonymousProfile } from '../../../models/anonymity';
import { Modal } from '../../../structures/interactions/Modal';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageSpecificProfile } from '../../../views/anonymity';

export default new Modal('anon-set-avatar')
	.set((modal) => {
		modal.setTitle('Set Avatar');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('avatar').setLabel('Avatar Image URL').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('This modal was invalid [ERR01]');

		const profileID = parseInt(cache);
		if (isNaN(profileID)) throw new InteractionError('This model was invalid [ERR02]');

		const avatar = i.fields.getTextInputValue('avatar');
		if (!avatar) throw new InteractionError('No avatar URL was provided');

		const urlValidator = z.string().url();
		const check = urlValidator.safeParse(avatar);
		if (!check.success) throw new InteractionError('The supplied URL was invalid');

		const profile = await getAnonymousProfile(profileID);
		if (!profile) throw new InteractionError('This profile no longer exists');

		const updated = await updateAnonymousProfile(profile.id, {
			avatar: avatar.trim(),
		});

		const payload = await anonEmbedManageSpecificProfile(updated);
		return await i.reply({ ...payload, ephemeral: true });
	});
