import { Colors, Role } from 'discord.js';
import config from '../../config';
import { prisma } from '../..';
import { getSignup } from '../../models/signups';
import { CustomButtonBuilder } from '../../structures/interactions/Button';
import { InteractionError } from '../../structures/interactions/_Interaction';
import { Logger, LogType } from '../../util/logger';
import { signupSettingsMain, formatSignupEmbed } from '../../views/signups';

export default new CustomButtonBuilder('button-category')
	.onGenerate((builder) => builder.setLabel('Manage Toggle'))
	.onExecute(async (i, cache) => {
		if (!i.guild) return new InteractionError('This button cannot be used outside of a server');
		if (!cache) return new InteractionError('This button is invalid as it has no valid cache attached');

		const logger = new Logger(config.SIGNUP_LOG_WEBHOOK ?? config.GENERAL_LOG_WEBHOOK ?? undefined);

		await i.deferReply({ ephemeral: true });

		const member = await i.guild.members.fetch(i.user.id);
		if (!member) return i.editReply({ content: 'Failed to fetch member.' });
		const messageId = i.message.id;
		if (!messageId) return i.editReply({ content: 'This button is invalid' });
		const signup = await getSignup({ messageId });
		if (!signup) return i.editReply({ content: 'This button is invalid' });

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
						logger.log(LogType.Error, `Failed to remove role <@&${role}> from user ${member.user.username} <#${signup.channelId}>`);
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

				if (count > 0) logger.log(LogType.Info, `User ${i.user.username} has left ${category.name} in <#${signup.channelId}>`, Colors.Red);
			}
		} else if (cache == 'settings') {
			const isAdmin = member.permissions.has('Administrator');
			const isHost = signup.hosts.map((v) => v.user.discordId).includes(i.user.id);
			if (!(isAdmin || isHost)) return i.editReply({ content: 'You do not have permission to edit this signup' });
			const payload = signupSettingsMain(signup);
			return i.editReply(payload);
		} else {
			const categoryId = parseInt(cache);
			if (isNaN(categoryId)) return i.editReply({ content: 'This button is invalid' });

			const addRoles: Role[] = [];

			for (const category of signup.categories) {
				await removeFromCategory(category.id, i.user.id);
				if (category.id == categoryId) {
					const exists = category.users.find((x) => x.id == fetchedUser.id);
					if (exists) return i.editReply({ content: 'You are already in this category' });
					else if (fetchedUser.signupBanned) return i.editReply({ content: 'You are banned from signing up' });
					else {
						await prisma.signupUserJunction.create({ data: { signupCategoryId: categoryId, userId: fetchedUser.id } });

						if (category.attachedRoleId) {
							try {
								const role = await i.guild.roles.fetch(category.attachedRoleId);
								if (!role) throw Error('Role not found');

								addRoles.push(role);
							} catch (err) {
								logger.log(LogType.Error, `Failed to add role <@&${category.attachedRoleId}> to user ${member.user.username} in <#${signup.channelId}>`, Colors.Red);
							}
						}

						logger.log(LogType.Info, `User ${i.user.username} has joined ${category.name} in <#${signup.channelId}>`, category.isFocused ? Colors.Green : Colors.Yellow);
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

		const { embed, row } = formatSignupEmbed(reset);

		await i.message.edit({ embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
		await i.deleteReply();
	});
