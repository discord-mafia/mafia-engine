import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { Button } from '../../../builders/button';
import { HydratedSignup } from '../../../db/signups';
import { manageCategories, miscSettings, signupSettingsHome } from './general';

export const editCategoryButton = new Button('signup-edit-category')
	.setLabel('Edit Category')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const addCategoryButton = new Button('signup-add-category')
	.setLabel('New Category')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const removeCategoryButton = new Button('signup-remove-category')
	.setLabel('Remove Category')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export async function generalCategoriesEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Categories - ${signup.name}`);
	embed.setColor('White');

	embed.setDescription('Click the button below to add a new category');

	const categories: string[] = [];
	for (const category of signup.categories) {
		let categoryStr = `> ${category.name}`;
		if (category.limit)
			categoryStr += ` [${category.users.length}/${category.limit}]`;
		else categoryStr += ` [${category.users.length}]`;
		categories.push(categoryStr);
	}

	if (categories.length > 0)
		embed.addFields({
			name: 'Categories',
			value: `${categories.join('\n')}`,
		});
	else
		embed.addFields({
			name: 'Categories',
			value: 'This signup has no categories',
		});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(signupSettingsHome.build());
	row.addComponents(addCategoryButton.build());
	if (categories.length > 0) {
		row.addComponents(editCategoryButton.build());
		row.addComponents(removeCategoryButton.build());
	}

	return {
		embed,
		row,
	};
}
