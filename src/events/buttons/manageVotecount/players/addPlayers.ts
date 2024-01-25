import { type UserSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import AddPlayersMenu from '../../../selectMenus/manageVotecount/addPlayers';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';

export default new CustomButtonBuilder('manage-vc-players-add')
	.onGenerate((builder) => builder.setLabel('Add Player/s'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);
		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(AddPlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	});
