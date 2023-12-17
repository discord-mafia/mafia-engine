import { ActionRowBuilder, type UserSelectMenuBuilder, type ButtonBuilder, type ButtonInteraction, type CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';
import { InteractionError } from '@structures/interactions/_Interaction';
import VoteWeightPlayerMenu from '@root/events/selectMenus/manageVotecount/selectPlayerVoteWeight';

export default class ManageVoteWeight extends CustomButton {
	static customId = 'manage-vc-players-set-vote-weight';
	constructor() {
		super(ManageVoteWeight.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const newVC = await getVoteCounter({ channelId: i.channel.id });
		if (!newVC) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const stateMenuPayload = genStateEmbed(newVC);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();
		const select = VoteWeightPlayerMenu.getUserSelectMenuOrThrow(VoteWeightPlayerMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		await i.update({ ...stateMenuPayload, components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Set Vote Weight');
	}
}
