import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../../../builders/modal';
import { ErrorCode, InteractionError } from '../../../../utils/errors';
import { editCategory, getHydratedCategory } from '../../../../db/signups';
import { genEditCategoryMenu } from './editCategory';
import { onSignupUpdate } from '../../signupUpdateEvent';

export const renameCategoryModal = new Modal('rename-category')
	.setCustomId('rename-category')
	.setTitle('Rename Category')
	.set(
		new TextInputBuilder()
			.setLabel('New Title')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setCustomId('title')
			.setMinLength(1)
			.setMaxLength(32),
		new TextInputBuilder()
			.setLabel('Button Label')
			.setStyle(TextInputStyle.Short)
			.setRequired(false)
			.setCustomId('button')
			.setMinLength(1)
			.setMaxLength(32)
	)
	.onExecute(async (i, ctx) => {
		if (!ctx)
			throw new InteractionError(
				'This modal is invalid (no supplied category)'
			);

		const categoryId = parseInt(ctx);
		if (isNaN(categoryId))
			throw new InteractionError(
				`Invalid context, expected an integer but got ${ctx}`
			);

		const newTitle = i.fields.getTextInputValue('title');
		if (!newTitle)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must provide a new name for the category',
			});

		const newButton = i.fields.getTextInputValue('button');
		if (!newButton)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must provide a new button name for the category',
			});

		const category = await editCategory(categoryId, {
			name: newTitle,
			buttonName: newButton,
		});
		if (!category) throw new InteractionError('Invalid category');

		await i.deferUpdate();

		const hydratedCategory = await getHydratedCategory(categoryId);
		if (!hydratedCategory) throw new InteractionError('Invalid category');

		const { embed, rows } = genEditCategoryMenu(hydratedCategory);
		await i.editReply({
			embeds: [embed],
			components: rows,
		});

		await onSignupUpdate.publish({
			signupId: category.signupId,
		});
	});
