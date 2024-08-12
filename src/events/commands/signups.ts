import { prisma } from '../..';
import { getSignup } from '../../models/signups';
import { getOrCreateUser } from '../../models/users';
import { SlashCommand } from '../../structures/interactions/SlashCommand';
import { formatSignupEmbed } from '../../views/signups';

const signupTemplates: string[] = ['Basic', 'Mentors'];

export default new SlashCommand('signups')
	.setDescription('Create a signup post')
	.set((cmd) => {
		cmd.addStringOption((title) => title.setName('title').setDescription('Title for the signup').setRequired(false));
		cmd.addIntegerOption((limit) => limit.setName('limit').setDescription('Limit the number of signups').setRequired(false));
		cmd.addStringOption((template) =>
			template
				.setName('template')
				.setDescription('The template to use, default = basic')
				.addChoices(
					...signupTemplates.map((v) => {
						return {
							name: v,
							value: v,
						};
					})
				)
		);
		cmd.addUserOption((user) => user.setName('host').setDescription('Game host #1').setRequired(false));
		cmd.addUserOption((user) => user.setName('host2').setDescription('Game host #2').setRequired(false));
		cmd.addUserOption((user) => user.setName('moderator').setDescription('Game moderator').setRequired(false));
		cmd.addUserOption((user) => user.setName('balancer').setDescription('Game balancer').setRequired(false));
		cmd.addUserOption((user) => user.setName('balancer2').setDescription('Game balancer #2').setRequired(false));
		cmd.addBooleanOption((user) => user.setName('anonymous').setDescription('Hide the names of the players who sign up').setRequired(false));
	})
	.onExecute(async (i, _ctx) => {
		const title = i.options.getString('title') ?? 'Game Signups';
		const limit = i.options.getInteger('limit') ?? undefined;
		const template = i.options.getString('template') ?? signupTemplates[0];
		const isAnonymous = i.options.getBoolean('anonymous') ?? false;

		const hosts = (() => {
			const host1 = i.options.getUser('host');
			const host2 = i.options.getUser('host2');
			if (!host1) return [];
			if (!host2) return [host1];
			return [host1, host2];
		})();

		const moderator = i.options.getUser('moderator');

		const balancers = (() => {
			const balancer1 = i.options.getUser('balancer');
			const balancer2 = i.options.getUser('balancer2');
			if (!balancer1) return [];
			if (!balancer2) return [balancer1];
			return [balancer1, balancer2];
		})();

		if (!i.guild || !i.channelId) return i.reply({ content: 'This command can only be used in a server.', ephemeral: true });

		const deferred = await i.deferReply({ fetchReply: true });

		const categories = [];

		if (!template || template === 'Basic') {
			categories.push(
				{
					name: 'Players',
					limit: limit,
					buttonName: 'Play',
					isFocused: true,
				},
				{
					name: 'Backups',
					buttonName: 'Backup',
				}
			);
		} else if (template === 'Mentors') {
			categories.push(
				{
					name: 'Players',
					limit: limit,
					buttonName: 'Play',
					isFocused: true,
				},
				{
					name: 'Mentors',
					limit: limit,
					buttonName: 'Mentor',
				},
				{
					name: 'Backups',
					buttonName: 'Backup',
				}
			);
		}

		const signup = await prisma.signup.create({
			data: {
				name: title,
				channelId: i.channelId,
				messageId: deferred.id,
				serverId: i.guild.id,
				categories: {
					createMany: {
						skipDuplicates: true,
						data: categories,
					},
				},
				isAnonymous: isAnonymous,
			},
		});

		for (const host of hosts) {
			const member = i.guild.members.cache.get(host.id);
			if (!member) continue;
			const user = await getOrCreateUser(member);
			if (!user) continue;
			await prisma.signupHostJunc.create({
				data: {
					signupId: signup.id,
					userId: user.id,
				},
			});
		}

		if (moderator) {
			const member = i.guild.members.cache.get(moderator.id);
			if (member) {
				const user = await getOrCreateUser(member);
				if (user) {
					await prisma.signupModJunc.create({
						data: {
							signupId: signup.id,
							userId: user.id,
						},
					});
				}
			}
		}

		for (const balancer of balancers) {
			const member = i.guild.members.cache.get(balancer.id);
			if (!member) continue;
			const user = await getOrCreateUser(member);
			if (!user) continue;
			await prisma.signupBalancerJunc.create({
				data: {
					signupId: signup.id,
					userId: user.id,
				},
			});
		}

		const fetchedSignup = await getSignup({ signupId: signup.id });
		if (!fetchedSignup) return i.editReply({ content: 'Failed to create signup post.' });

		const { embed, row } = formatSignupEmbed(fetchedSignup);

		try {
			await deferred.startThread({
				name: 'Discussion',
			});
		} catch (err) {
			console.log(err);
		}

		await i.editReply({ content: '', embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
	});
