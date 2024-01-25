import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import VoteWeightPlayerMenu from '@root/events/selectMenus/manageVotecount/selectPlayerVoteWeight';
import { InteractionError } from '@structures/interactions/_Interaction';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';
import { ActionRowBuilder, UserSelectMenuBuilder } from 'discord.js';

export default new CustomButtonBuilder('manage-vc-players-set-vote-weight')
	.onGenerate((builder) => builder.setLabel('Set Vote Weight'))
	.onExecute(async (i) => {
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
	});
