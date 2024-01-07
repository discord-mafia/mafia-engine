import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { CustomError } from '@utils/errors';

export default new SlashCommand('manage')
	.setDescription('Manage an part of the bot')
	.set((cmd) => {
		cmd.addSubcommand((sub) => sub.setName('votecount').setDescription('Manage the votecounter in this channel'));
	})
	.onExecute(async (i) => {
		if (!i.guild) return;
		const subcommand = i.options.getSubcommand(true);

		try {
			if (subcommand === 'votecount') {
				const vc = (await getVoteCounter({ channelId: i.channelId })) ?? undefined;
				if (!vc) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
				const payload = genVoteCountEmbed(vc);
				return i.reply({ ...payload, ephemeral: true });
			} else {
				return i.reply({
					content: 'Unknown subcommand',
					ephemeral: true,
				});
			}
		} catch (err) {
			if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
			else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
			else console.log(err);
		}
	});
