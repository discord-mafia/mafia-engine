import { CustomUserSelectMenuBuilder } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { getVoteCounter, getPlayer } from '@models/votecounter';
import { genCreateVoteCountEmbed } from '@views/votecounter';
import SetVoteWeightModal from '../../modals/setVoteWeight';

export default new CustomUserSelectMenuBuilder('manage-vc-select-players-vote-weight')
	.onGenerate((builder) => builder.setMaxValues(1).setMinValues(1).setPlaceholder('The player to change vote weight'))
	.onExecute(async (i) => {
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
	});
