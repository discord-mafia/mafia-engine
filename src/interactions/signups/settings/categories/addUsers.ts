import { UserSelectMenu } from '../../../../builders/userSelectMenu';
import { addUserToCategory, getHydratedCategory } from '../../../../db/signups';
import { getOrInsertUser } from '../../../../db/users';
import { ErrorCode, InteractionError } from '../../../../utils/errors';
import { onSignupUpdate } from '../../signupUpdateEvent';
import { genEditCategoryMenu } from './editCategory';

export const addUserMenu = new UserSelectMenu('add-user-to-category')
	.setPlaceholder('Select users to add...')
	.setMinValues(1)
	.setMaxValues(25)
	.onExecute(async (i, ctx) => {
		if (!i.guild) {
			throw new InteractionError(
				'Cannot use this command outside of a server'
			);
		}

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

		if (
			category.limit &&
			userIds.length > category.limit - category.users.length
		) {
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: `Cannot add more than ${category.limit} users to this category, you have ${category.users.length} already and are attempting to add ${userIds.length}`,
			});
		}

		await i.deferUpdate();

		if (!userIds || userIds.length <= 0)
			throw new InteractionError({
				status: ErrorCode.BadRequest,
				message: 'You must select at least one user',
			});

		const failedToAdd: string[] = [];

		for (const userId of userIds) {
			try {
				const member = await i.guild.members.fetch(userId);
				if (!member) {
					failedToAdd.push(userId);
					continue;
				}
				const user = await getOrInsertUser({
					id: userId,
					username: member.user.username,
				});

				if (!user) {
					failedToAdd.push(userId);
					continue;
				}

				const result = await addUserToCategory({
					categoryId: category.id,
					userId: user.id,
				});

				if (!result) failedToAdd.push(userId);
			} catch (e) {
				failedToAdd.push(userId);
			}
		}

		if (failedToAdd.length > 0) {
			await i.followUp({
				content: `Failed to add ${failedToAdd
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
