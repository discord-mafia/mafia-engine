import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../..';
import { Button } from '../../structures/interactions';
import { getSignup } from '../../util/database';
import { sign } from 'crypto';
import { formatSignupEmbed } from '../../util/embeds';

export default new Button('button-category')
	.setButton(new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger))
	.onExecute(async (i, cache) => {
		if (!cache) return i.reply({ content: 'This button is invalid', ephemeral: true });
		if (!i.guild) return;

		const messageId = i.message.id;
		if (!messageId) return i.reply({ content: 'This button is invalid', ephemeral: true });
		const signup = await getSignup({ messageId });
		if (!signup) return i.reply({ content: 'This button is invalid', ephemeral: true });

		await i.deferReply({ ephemeral: true });

		await i.guild.members.fetch();
		const member = i.guild.members.cache.get(i.user.id);
		if (!member) return i.editReply({ content: 'Failed to fetch member.' });

		const fetchedUser =
			(await prisma.user.findUnique({
				where: {
					discordId: i.user.id,
				},
			})) ??
			(await prisma.user.create({
				data: {
					discordId: member.id,
					username: member.displayName,
				},
			}));
		// Fetch or Create the user.

		const removeFromCategory = async (categoryId: number, discordId: string) => {
			try {
				await prisma.signupUserJunction.deleteMany({
					where: {
						signupCategoryId: categoryId,
						user: {
							discordId: i.user.id,
						},
					},
				});
			} catch (err) {
				console.log(err);
			}
		};

		if (cache == 'leave') {
			for (const category of signup.categories) {
				await removeFromCategory(category.id, i.user.id);
			}
		} else if (cache == 'settings') {
		} else {
			const categoryId = parseInt(cache);
			if (isNaN(categoryId)) return i.editReply({ content: 'This button is invalid' });

			for (const category of signup.categories) {
				if (category.id != categoryId) await removeFromCategory(category.id, i.user.id);
			}

			await prisma.signupUserJunction.create({
				data: {
					userId: fetchedUser.id,
					signupCategoryId: categoryId,
				},
			});
		}

		const reset = await getSignup({ messageId });
		if (!reset) return i.editReply({ content: 'This button failed' });
		const { embed, row } = formatSignupEmbed(reset);

		await i.message.edit({ embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
		await i.deleteReply();
	});
