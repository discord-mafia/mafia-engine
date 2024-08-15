import { ButtonStyle } from 'discord.js';
import { Button } from '../builders/button';
import { SlashCommand } from '../builders/slashCommand';
import { db } from '../controllers/database';
import { users } from '../db/schema';

export const test = new SlashCommand('test').onExecute(async (i) => {
	const all_users = await db.select().from(users);
	const btn = button.buildAsRow();
	await i.reply({
		content: `There are ${all_users.length} users in the database.`,
		components: [btn],
		ephemeral: true,
	});
});

export const button = new Button('test')
	.setStyle(ButtonStyle.Primary)
	.setLabel('Create User')
	.onExecute(async (i) => {
		const inserted_user = await db.insert(users).values({
			id: i.user.id,
			username: i.user.username,
		});
		console.log(inserted_user);
		await i.reply({ content: 'Created user', ephemeral: true });
	});
