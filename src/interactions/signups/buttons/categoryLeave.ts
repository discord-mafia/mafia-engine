import { ButtonStyle } from 'discord.js';
import { Button } from '../../../builders/button';
import { getOrInsertUser } from '../../../db/users';
import { InteractionError } from '../../../utils/errors';
import { getHydratedSignup, leaveSignups } from '../../../db/signups';
import {
	formatSignupEmbed,
	formatSignupComponents,
} from '../../../views/signup';

export const leaveCategoryBtn = new Button('signup-leave')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('❌')
	.onExecute(async (i, _) => {
		const user = await getOrInsertUser({
			id: i.user.id,
			username: i.user.username,
		});

		if (!user)
			throw new InteractionError('Unable to fetch your user account');

		await leaveSignups(user.id, i.message.id);

		const hydratedSignup = await getHydratedSignup(i.message.id);
		if (!hydratedSignup)
			throw new InteractionError('Failed to fetch signup');

		const embed = formatSignupEmbed(hydratedSignup);
		const components = formatSignupComponents(hydratedSignup);

		await i.update({ embeds: [embed], components: [components] });
	});
