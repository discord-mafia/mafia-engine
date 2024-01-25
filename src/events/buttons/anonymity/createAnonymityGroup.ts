import type { ButtonBuilder, ButtonInteraction, CacheType } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { embedCreateAnonymousGroup } from '@views/anonymity';

export default class CreateAnonymityGroup extends CustomButton {
	static customId = 'manage-anonymity-create';
	constructor() {
		super(CreateAnonymityGroup.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = embedCreateAnonymousGroup();
		await i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Create Anonymous Group');
	}
}
