import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../../../builders/modal';
import { ErrorCode, InteractionError } from '../../../../utils/errors';
import { editCategory, getHydratedCategory } from '../../../../db/signups';
import { genEditCategoryMenu } from './editCategory';
import { onSignupUpdate } from '../../signupUpdateEvent';

export const changeLimitModal = new Modal('change-category-limit')
	.setCustomId('limit-category')
	.setTitle('Change Limit')
	.set(
		new TextInputBuilder()
			.setLabel('New Limit (type "blank" for no limit)')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setCustomId('limit')
			.setMinLength(1)
			.setMaxLength(5)
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

		const newLimit = i.fields.getTextInputValue('limit');
		if (!newLimit)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must provide a new name for the category',
			});

		let limit: undefined | number = undefined;
		if (newLimit.toLowerCase() == 'blank') limit = undefined;
		else if (!isNaN(parseInt(newLimit))) limit = parseInt(newLimit);
		else {
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message:
					'Invalid limit, must supply a number or a blank string',
			});
		}

		const category = await editCategory(categoryId, {
			limit: limit ?? null,
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
