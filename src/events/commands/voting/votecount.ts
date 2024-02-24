import { getVoteCounter } from '../../../models/votecounter';
import { SlashCommand } from '../../../structures/interactions/SlashCommand';
import { calculateVoteCount, formatVoteCount } from '../../../views/votecounter';

export default new SlashCommand('votecount')
	.setDescription('[GAME] View the vote count')
	.set((cmd) => {
		cmd.addBooleanOption((opt) => opt.setName('hidden').setDescription('To make this for only you to see').setRequired(false));
	})
	.onExecute(async (i) => {
		if (!i.guild) return;
		const hidden = i.options.getBoolean('hidden', false) ?? false;

		try {
			const voteCounter = await getVoteCounter({ channelId: i.channelId });
			if (!voteCounter) return i.reply({ content: 'This is not a vote channel', ephemeral: true });

			const calculated = calculateVoteCount(voteCounter);
			const format = formatVoteCount(calculated);

			return i.reply({ content: format, ephemeral: hidden });
		} catch (err) {
			console.log(err);
			return i.reply({ content: 'An error occured while accessing the vote count', ephemeral: true });
		}
	});
