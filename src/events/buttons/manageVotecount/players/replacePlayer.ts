import { type UserSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';
import ReplacePlayersMenu from '@root/events/selectMenus/manageVotecount/replacePlayer';

export default new CustomButtonBuilder('manage-vc-players-replace')
	.onGenerate((builder) => builder.setLabel('Replace Player/s'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(ReplacePlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	});
