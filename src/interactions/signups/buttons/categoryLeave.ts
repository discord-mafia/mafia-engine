import { ButtonStyle } from 'discord.js';
import { Button } from '../../../builders/button';
import { getOrInsertUser } from '../../../db/users';
import { InteractionError } from '../../../utils/errors';
import { leaveSignups, getSignupByChannel } from '../../../db/signups';
import { onSignupUpdate } from '../signupUpdateEvent';
import { logSignup, LogType } from '../../../utils/logging';

export const leaveCategoryBtn = new Button('signup-leave')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('❌')
	.onExecute(async (i, _) => {
		const user = await getOrInsertUser({
			id: i.user.id,
			username: i.user.username,
		});

		if (!i.channelId) throw new InteractionError('Invalid channel');

		if (!user)
			throw new InteractionError('Unable to fetch your user account');

		await leaveSignups(user.id, i.message.id);

		onSignupUpdate.publish({
			messageId: i.message.id,
			i,
		});

		const signup = await getSignupByChannel(i.channelId);
		if (signup && !signup.isAnonymous) {
			await logSignup({
				user: user.username,
				type: LogType.LEAVE,
				channelId: i.message.channelId,
			});
		}
	});
