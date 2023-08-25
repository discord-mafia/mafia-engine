import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, type Role } from 'discord.js';
import { prisma } from '../..';
import { Button } from '../../structures/interactions';
import { getSignup } from '../../util/database';
import { formatSignupEmbed } from '../../util/embeds';
import { sendInfoLog } from '../../structures/logs';
import { isTurboFull } from '../../clock/turbos';
import { setupTurbo } from '../../structures/turbos/turboSignups';

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

		const member = await i.guild.members.fetch(i.user.id);
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

		const removeFromCategory = async (categoryId: number, _discordId: string) => {
			try {
				const deleted = await prisma.signupUserJunction.deleteMany({
					where: {
						signupCategoryId: categoryId,
						user: {
							discordId: i.user.id,
						},
					},
				});

				const signupCategoryRoles: (string | null)[] = signup.categories.map((x) => x.attachedRoleId);
				for (const role of signupCategoryRoles) {
					if (!role || !i.guild) continue;
					try {
						const hasRole = member.roles.cache.has(role);
						if (hasRole) member.roles.remove(role);
					} catch (err) {
						await sendInfoLog('Failed to remove role', `Failed to remove role <@&${role}> from user ${member.user.username}`, Colors.Red);
					}
				}

				if (signup.isTurbo) {
					const hasHost = await prisma.signupUserJunction.findFirst({
						where: {
							signupCategoryId: categoryId,
							isTurboHost: true,
						},
					});

					if (!hasHost) {
						const randomUser = await prisma.signupUserJunction.findFirst({
							where: {
								signupCategoryId: categoryId,
							},
						});

						if (randomUser)
							await prisma.signupUserJunction.update({
								where: {
									id: randomUser.id,
								},
								data: {
									isTurboHost: true,
								},
							});
					}
				}

				return deleted.count;
			} catch (err) {
				console.log(err);
				return 0;
			}
		};

		if (cache == 'leave') {
			for (const category of signup.categories) {
				const count = await removeFromCategory(category.id, i.user.id);
				if (count > 0)
					sendInfoLog(
						`Leaving Signup: ${category.name} in <#${signup.channelId}>`,
						`User ${i.user.username} has left ${category.name} in signup ${signup.id} (<#${signup.channelId}>)`,
						Colors.Red
					);
			}
		} else if (cache == 'settings') {
			const isAdmin = member.permissions.has('Administrator');
			const isHost = signup.hostRoleId ? member.roles.cache.has(signup.hostRoleId) : false;
			if (!isAdmin && !isHost) return i.editReply({ content: 'You do not have permission to edit this signup' });

			const embed = new EmbedBuilder();
			embed.setColor('White');
			embed.setTitle('Signup Management');
			embed.setDescription('This is your hub to manage the signup. Only designated hosts and admins can access this.');

			embed.addFields(
				{
					name: 'Signup Index',
					value: '> ' + signup.id.toString(),
					inline: true,
				},
				{
					name: 'Category Index List',
					value: signup.categories.length > 0 ? signup.categories.map((x) => `> ${x.name} - ${x.id}`).join('\n') : '> None',
					inline: true,
				}
			);

			const row = new ActionRowBuilder<ButtonBuilder>();
			row.addComponents(new ButtonBuilder().setCustomId('signup-manage-role').setLabel('Add Roles').setStyle(ButtonStyle.Secondary));
			row.addComponents(
				new ButtonBuilder().setCustomId('signup-manage-category').setLabel('Manage Categories').setStyle(ButtonStyle.Secondary)
			);
			row.addComponents(new ButtonBuilder().setCustomId('signup-manage-chats').setLabel('Create Player Chats').setStyle(ButtonStyle.Secondary));

			return i.editReply({ embeds: [embed], components: [row] });
		} else {
			const categoryId = parseInt(cache);
			if (isNaN(categoryId)) return i.editReply({ content: 'This button is invalid' });

			const addRoles: Role[] = [];

			for (const category of signup.categories) {
				await removeFromCategory(category.id, i.user.id);
				if (category.id == categoryId) {
					const exists = category.users.find((x) => x.id == fetchedUser.id);
					if (exists) return i.editReply({ content: 'You are already in this category' });
					else {
						await prisma.signupUserJunction.create({ data: { signupCategoryId: categoryId, userId: fetchedUser.id } });

						if (category.attachedRoleId) {
							try {
								const role = await i.guild.roles.fetch(category.attachedRoleId);
								if (!role) throw Error('Role not found');

								addRoles.push(role);
							} catch (err) {
								console.log(err);
								await sendInfoLog(
									'Failed to add role',
									`Failed to add role <@&${category.attachedRoleId}> to user ${member.user.username}`,
									Colors.Red
								);
							}
						}

						sendInfoLog(
							`Joining Signup: ${category.name} in <#${signup.channelId}>`,
							`User ${i.user.username} has joined ${category.name} in signup ${signup.id} (<#${signup.channelId}>)`,
							category.isFocused ? Colors.Green : Colors.Yellow
						);
					}
				}
			}

			for (const role of addRoles) {
				const hasRole = member.roles.cache.has(role.id);
				if (!hasRole) {
					const usr = await member.roles.add(role.id);
					console.log(usr.roles.cache.filter((x) => x.id == role.id).map((x) => x.name) ?? 'Not there');
				}
			}
		}

		const reset = await getSignup({ messageId });
		if (!reset) return i.editReply({ content: 'This button failed' });

		const isTurboAndFull = isTurboFull(reset);
		if (isTurboAndFull) setupTurbo(reset);

		const { embed, row } = formatSignupEmbed(reset);

		await i.message.edit({ embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
		await i.deleteReply();
	});
