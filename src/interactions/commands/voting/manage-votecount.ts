import { SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../../structures/BotClient';
import { getVoteCounter } from '../../../util/database';
import { CustomError } from '../../../util/errors';
import { generateBaseVcMenu, manageVoteCountEmbeds } from '../../../events/buttons/manageVotecount/goHome';

const data = new SlashCommandBuilder().setName('manage-votecount').setDescription('Commands surrounding vote counts');

export default newSlashCommand({
	data,
	serverType: ServerType.MAIN,
	execute: async (i) => {
		if (!i.guild) return;

		try {
			const vc = (await getVoteCounter({ channelId: i.channelId })) ?? undefined;
			if (!vc) return i.reply({ ...manageVoteCountEmbeds.create(), ephemeral: true });
			const payload = generateBaseVcMenu(vc);
			return i.reply({ ...payload, ephemeral: true });
		} catch (err) {
			if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
			else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
			else console.log(err);
		}
	},
});
