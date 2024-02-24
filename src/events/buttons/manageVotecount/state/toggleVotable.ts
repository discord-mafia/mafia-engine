import selectPlayerToggleVotable from '@root/events/selectMenus/manageVotecount/selectPlayerToggleVotable';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { InteractionError } from '@structures/interactions/_Interaction';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';
import { ActionRowBuilder, UserSelectMenuBuilder } from 'discord.js';

export default new CustomButtonBuilder('manage-vc-players-toggle-votable')
	.onGenerate((builder) => builder.setLabel('Toggle Player Votable'))
	.onExecute(async (i) => {
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const newVC = await getVoteCounter({ channelId: i.channel.id });
		if (!newVC) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const stateMenuPayload = genStateEmbed(newVC);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();
		row.addComponents(selectPlayerToggleVotable.build());

		await i.update({ ...stateMenuPayload, components: [row] });
	});
