import { ButtonStyle } from 'discord.js';
import { Button } from '../../../builders/button';
import { getOrInsertUser } from '../../../db/users';
import { ErrorCode, InteractionError } from '../../../utils/errors';
import {
	addUserToCategory,
	getHydratedCategory,
	leaveSignups,
} from '../../../db/signups';
import { onSignupUpdate } from '../signupUpdateEvent';
import { logSignup, LogType } from '../../../utils/logging';

export const categoryJoinButton = new Button('signup-join')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i, ctx) => {
		if (!ctx) throw new InteractionError('Invalid context');
		const user = await getOrInsertUser({
			id: i.user.id,
			username: i.user.username,
		});

		if (!user)
			throw new InteractionError('Unable to fetch your user account');

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

		await leaveSignups(user.id, i.message.id);
		await addUserToCategory({
			categoryId,
			userId: user.id,
		});

		await onSignupUpdate.publish({
			messageId: i.message.id,
			i,
		});

		await logSignup({
			categoryName: category.name,
			user: user.username,
			type: LogType.JOIN,
			channelId: i.message.channelId,
		});
	});
