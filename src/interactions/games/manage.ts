import { ChannelType, EmbedBuilder } from 'discord.js';
import { Game, gameQueues, isValidGameQueue } from '../../db/games/games';
import { SubCommand } from '../../builders/subcommand';
import { InteractionError, ErrorCode } from '../../utils/errors';

export const manageGame = new SubCommand('manage')
	.setDescription('Manage a game')
	.addStringOption((o) =>
		o
			.setName('queue')
			.setDescription('Name of the game')
			.setChoices(
				...gameQueues.enumValues.map((q) => ({ name: q, value: q }))
			)
			.setRequired(true)
	)
	.addIntegerOption((o) =>
		o.setName('index').setDescription('Queue index').setRequired(true)
	)
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError(ErrorCode.OutOfServer);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(ErrorCode.OutOfTextChannel);

		const queue = i.options.getString('queue', true);
		if (!isValidGameQueue(queue))
			throw new InteractionError(ErrorCode.BadRequest);

		const index = i.options.getInteger('index', true);

		const game = await Game.fromQueueIndex(queue, index);
		if (!game) throw new InteractionError(ErrorCode.NotFound);

		const { embed } = await genManageGameEmbed(game);
		await i.reply({ embeds: [embed], ephemeral: true });
	});

export async function genManageGameEmbed(game: Game) {
	const { name } = game.getData();

	const embed = new EmbedBuilder();
	embed.setTitle(name);

	const usergroups = await game.fetchUsergroups();
	for (const usergroup of usergroups) {
		const { name: usergroupName } = usergroup.getData();
		const participants = await usergroup.fetchParticipants();
		const partList: string[] = [];
		for (const participant of participants) {
			const username = await participant.generateUsername();
			partList.push('> ' + username);
		}

		let value = '> No slots';
		if (partList.length > 0) {
			value = partList.join('\n');
		}

		embed.addFields({ name: usergroupName, value });
	}

	if (usergroups.length == 0) {
		embed.addFields({ name: 'Usergroups', value: '> None' });
	}

	return { embed };
}
