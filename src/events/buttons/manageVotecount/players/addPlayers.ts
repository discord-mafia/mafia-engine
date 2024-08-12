import { type UserSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import AddPlayersMenu from '../../../selectMenus/manageVotecount/addPlayers';
import { getVoteCounter } from '../../../../models/votecounter';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '../../../../views/votecounter';

export default new CustomButtonBuilder('manage-vc-players-add')
	.onGenerate((builder) => builder.setLabel('Add Player/s'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);
		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		row.addComponents(AddPlayersMenu.build());

		i.update({ embeds: payload.embeds, components: [row] });
	});
