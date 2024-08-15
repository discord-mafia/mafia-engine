import { ButtonStyle } from 'discord.js';
import { Button } from '../builders/button';
import { SlashCommand } from '../builders/slashCommand';
import { getUser, insertUser } from '../db/users';

export const test = new SlashCommand('test').onExecute(async (i) => {
	const current_user = await getUser(i.user.id);

	if (!current_user) {
		const btn = button.buildAsRow();
		return await i.reply({
			content: 'You are not currently signed up.',
			components: [btn],
			ephemeral: true,
		});
	}

	await i.reply({
		content: `You are currently signed up as ${current_user.username}`,
		ephemeral: true,
	});
});

export const button = new Button('test')
	.setStyle(ButtonStyle.Primary)
	.setLabel('Create User')
	.onExecute(async (i) => {
		const inserted_user = await insertUser({
			id: i.user.id,
			username: i.user.username,
		});

		if (!inserted_user)
			return await i.reply({
				content: 'Failed to create user',
				ephemeral: true,
			});

		await i.reply({ content: 'Created user', ephemeral: true });
	});
