import { type UserSelectMenuInteraction, type CacheType } from 'discord.js';
import { UserSelectMenu } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { getVoteCounter, getPlayer } from '@models/votecounter';
import { genCreateVoteCountEmbed } from '@views/votecounter';
import SetVoteWeightModal from '../../modals/setVoteWeight';

export default class VoteWeightPlayerMenu extends UserSelectMenu {
	static customId = 'manage-vc-select-player-vote-weight';
	constructor() {
		super(VoteWeightPlayerMenu.customId);
	}

	async onExecute(i: UserSelectMenuInteraction<CacheType>) {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const values = i.values ?? [];
		const playerID = values[0];
		if (!playerID) throw new InteractionError('No user was provided');

		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const player = await getPlayer(vc.id, playerID);
		if (!player) throw new InteractionError('The player must be registered in this vote-count');

		const modal = SetVoteWeightModal.getModalBuilder();
		modal.setCustomId(SetVoteWeightModal.createCustomID(playerID));
		await i.showModal(modal);
	}

	generateUserSelectMenu() {
		return super.generateUserSelectMenu().setMaxValues(1).setMinValues(1).setPlaceholder('The player to change vote weight');
	}
}
