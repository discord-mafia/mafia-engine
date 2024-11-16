import {
	ButtonStyle,
	ChannelType,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { Button } from '../../../builders/button';
import { CustomId } from '../../../utils/customId';
import { ErrorCode, InteractionError } from '../../../utils/errors';
import { Modal } from '../../../builders/modal';
import { Game } from '../../../db/games/games';
import { genManageGameEmbed } from '../manage';

export const renameGameBtn = new Button('rename-game')
	.setLabel('Rename')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i, ctx) => {
		if (!ctx)
			throw new InteractionError(
				'This button is invalid (no supplied game ID)'
			);
		const modal = renameGameModal.build(
			new CustomId(renameGameModal.getCustomId(), ctx).getHydrated()
		);
		await i.showModal(modal);
	});

export const renameGameModal = new Modal('rename-game')
	.setCustomId('rename-usergroup')
	.setTitle('Rename Game')
	.set(
		new TextInputBuilder()
			.setLabel('New Title (dont include queue information)')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setCustomId('title')
			.setMinLength(1)
			.setMaxLength(32)
	)
	.onExecute(async (i, ctx) => {
		if (!ctx) throw new InteractionError(ErrorCode.MissingContext);
		if (!i.guild) throw new InteractionError(ErrorCode.OutOfServer);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(ErrorCode.OutOfTextChannel);

		const title = i.fields.getTextInputValue('title');
		if (!title) throw new InteractionError(ErrorCode.BadRequest);

		await i.deferUpdate();

		const parsedId = parseInt(ctx);
		if (isNaN(parsedId))
			throw new InteractionError(ErrorCode.MissingContext);

		const game = await Game.fromId(parsedId);
		if (!game) throw new InteractionError(ErrorCode.NotFound);

		const updatedGame = await game.update({ name: title });
		if (!updatedGame) throw new InteractionError(ErrorCode.Internal);

		const raw = await genManageGameEmbed(updatedGame);
		const { embed, components } = raw;
		await i.editReply({ embeds: [embed], components });
	});
