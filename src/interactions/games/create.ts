import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';
import { ErrorCode, InteractionError } from '../../utils/errors';
import { Game, gameQueues, isValidGameQueue } from '../../db/games/games';
import { genManageGameEmbed } from './manage';

export const createGame = new SubCommand('create')
	.setDescription('Create a new game')
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
		if (!i.guild) throw new InteractionError(ErrorCode.OUT_OF_SERVER);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(ErrorCode.OUT_OF_TEXT_CHANNEL);

		const queue = i.options.getString('queue', true);
		if (!isValidGameQueue(queue))
			throw new InteractionError(ErrorCode.BadRequest);

		const index = i.options.getInteger('index', true);

		await i.deferReply({ ephemeral: true });

		const existingGame = await Game.fromQueueIndex(queue, index);
		if (existingGame) throw new InteractionError(ErrorCode.Conflict);

		const game = await Game.create({
			queue,
			queueIndex: index,
			name: `${queue}_${index}`,
		});
		if (!game)
			throw new InteractionError({
				status: ErrorCode.Internal,
				message: 'Failed to create game',
			});

		const manageEmbed = await genManageGameEmbed(game);
		const { embed } = manageEmbed;

		return await i.editReply({
			embeds: [embed],
		});
	});
