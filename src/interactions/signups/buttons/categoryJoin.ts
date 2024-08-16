import { ButtonStyle } from 'discord.js';
import { Button } from '../../../builders/button';
import { getOrInsertUser } from '../../../db/users';
import { InteractionError } from '../../../utils/errors';
import { addUserToCategory, leaveSignups } from '../../../db/signups';
import { onSignupUpdate } from '../signups';

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

		await leaveSignups(user.id, i.message.id);
		await addUserToCategory({
			categoryId,
			userId: user.id,
		});

		onSignupUpdate.publish({
			messageId: i.message.id,
			i,
		});
	});
