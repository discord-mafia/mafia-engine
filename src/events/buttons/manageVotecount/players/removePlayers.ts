import { type UserSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';
import RemovePlayersMenu from '@root/events/selectMenus/manageVotecount/removePlayers';

export default new CustomButtonBuilder('manage-vc-players-remove')
	.onGenerate((builder) => builder.setLabel('Remove Player/s'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(RemovePlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	});
