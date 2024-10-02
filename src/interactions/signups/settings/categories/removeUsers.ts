import { UserSelectMenu } from '../../../../builders/userSelectMenu';
import {
	getHydratedCategory,
	removeUserFromCategory,
} from '../../../../db/signups';
import { ErrorCode, InteractionError } from '../../../../utils/errors';
import { onSignupUpdate } from '../../signupUpdateEvent';
import { genEditCategoryMenu } from './editCategory';

export const removeUserMenu = new UserSelectMenu('remove-user-from-category')
	.setPlaceholder('Select users to remove...')
	.setMinValues(1)
	.setMaxValues(25)
	.onExecute(async (i, ctx) => {
		if (!ctx)
			throw new InteractionError(
				'This button is invalid (no supplied category)'
			);

		const categoryId = parseInt(ctx);
		if (isNaN(categoryId))
			throw new InteractionError(
				`Invalid context, expected an integer but got ${ctx}`
			);

		const category = await getHydratedCategory(categoryId);
		if (!category)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Category not found',
			});

		const userIds = i.values;
		await i.deferUpdate();

		if (!userIds || userIds.length <= 0)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must select at least one user',
			});

		const failed: string[] = [];

		for (const userId of userIds) {
			try {
				const result = await removeUserFromCategory(
					userId,
					i.channelId,
					category.name
				);

				if (!result) failed.push(userId);
			} catch (e) {
				failed.push(userId);
			}
		}

		if (failed.length > 0) {
			await i.followUp({
				content: `Failed to remove ${failed
					.map((u) => `<@${u}>`)
					.join(', ')}`,
				ephemeral: true,
			});
		}

		const updatedCategory = await getHydratedCategory(categoryId);
		if (!updatedCategory)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Category not found',
			});

		const { embed, rows } = genEditCategoryMenu(updatedCategory);
		await i.editReply({
			embeds: [embed],
			components: [...rows],
		});

		await onSignupUpdate.publish({
			signupId: category.signupId,
		});
	});
