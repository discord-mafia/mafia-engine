import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { getSignup } from '../../util/database';
import { formatSignupEmbed } from '../../util/embeds';
import { prisma } from '../..';

const data = new SlashCommandBuilder().setName('signups').setDescription('Create a signup post');
data.addStringOption((title) => title.setName('title').setDescription('Title for the signup').setRequired(false));
data.addIntegerOption((limit) => limit.setName('limit').setDescription('Limit the number of signups').setRequired(false));

const signupTemplates: string[] = ['Basic', 'Mentors'];
data.addStringOption((template) =>
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

export default newSlashCommand({
	data,
	serverType: ServerType.MAIN,
	execute: async (i: ChatInputCommandInteraction) => {
		const title = i.options.getString('title') ?? 'Game Signups';
		const limit = i.options.getInteger('limit') ?? undefined;
		const template = i.options.getString('template') ?? signupTemplates[0];

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
			},
		});

		const fetchedSignup = await getSignup({ signupId: signup.id });
		if (!fetchedSignup) return i.editReply({ content: 'Failed to create signup post.' });

		const { embed, row } = formatSignupEmbed(fetchedSignup);

		try {
			const thread = await deferred.startThread({
				name: 'Discussion',
			});
			if (thread) {
				await thread.send({
					content:
						'This is the discussion thread for the signup post. Feel free to discuss the game here. There is a common mobile bug that shows buttons for the above embed, they do not work in this thread, use these instead',
					components: row.components.length > 0 ? [row] : undefined,
				});
			}
		} catch (err) {
			console.log(err);
		}

		await i.editReply({ content: '', embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
	},
});
