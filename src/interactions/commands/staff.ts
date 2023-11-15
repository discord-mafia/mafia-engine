import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import { getAllWithRole } from '../../util/discordRole';
import config from '../../config';

const StaffRoles: string[] = [
	'648664560936550400', // Co-Owners
	'648664724153565184', // Moderator
	'720121056320553021', // Helper
];

const CommunityContributorRoles: string[] = [
	'903394030904299541', // Technician
	'1134180413288501398', // Archivist
	'1163201195519787029', // Game Balancer
	'1174433972718157924', // Wiki Editor
];

const data = new SlashCommandBuilder().setName('staff').setDescription('See who the current staff are');
export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		await i.deferReply();

		const mainGuild = await i.client.guilds.fetch(config.MAIN_SERVER_ID);
		if (!mainGuild) return i.editReply('An error has occurred');

		try {
			const allStaff: Record<string, string[]> = {};
			const communityContributors: Record<string, string[]> = {};

			for (let j = 0; j < StaffRoles.length; j++) {
				const staffRoleID = StaffRoles[j];
				if (!staffRoleID) continue;
				const data = await getAllWithRole(mainGuild, staffRoleID);
				if (!data) continue;
				const { role, members } = data;
				const uniqueMembers: string[] = [];
				members.forEach((v) => {
					let isUnique = true;
					for (const staffTier in allStaff) {
						const staff = allStaff[staffTier];
						if (!staff) continue;
						if (staff.includes(v.id)) isUnique = false;
					}

					if (isUnique) uniqueMembers.push(v.id);
				});

				allStaff[role.name] = uniqueMembers;
			}

			for (let j = 0; j < CommunityContributorRoles.length; j++) {
				const staffRoleID = CommunityContributorRoles[j];
				if (!staffRoleID) continue;
				const data = await getAllWithRole(mainGuild, staffRoleID);
				if (!data) continue;
				const { role, members } = data;
				const uniqueMembers: string[] = [];
				members.forEach((v) => {
					let isUnique = true;
					for (const staffTier in allStaff) {
						const staff = allStaff[staffTier];
						if (!staff) continue;
						if (staff.includes(v.id)) isUnique = false;
					}

					if (isUnique) uniqueMembers.push(v.id);
				});

				communityContributors[role.name] = uniqueMembers;
			}

			const embed = new EmbedBuilder().setTitle('Current Staff').setThumbnail(i.guild.iconURL()).setColor('White');

			embed.setDescription('## Moderation Staff');

			let fullStr = '';
			fullStr += '## Moderation Staff\n';

			for (const staffTier in allStaff) {
				const staff = allStaff[staffTier] ?? [];

				let combinedStr = '';
				staff.forEach((v) => (combinedStr += `<@${v}>\n`));
				combinedStr.trim();
				if (combinedStr === '') combinedStr = '\u200B';

				fullStr += `### ${staffTier}\n${combinedStr}`;
			}

			fullStr += '## Community Contributor\n';

			for (const staffTier in communityContributors) {
				const staff = communityContributors[staffTier] ?? [];

				let combinedStr = '';
				staff.forEach((v) => (combinedStr += `<@${v}>\n`));
				combinedStr.trim();
				if (combinedStr === '') combinedStr = '\u200B';

				fullStr += `### ${staffTier}\n${combinedStr}`;
			}

			embed.setDescription(fullStr);

			return i.editReply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	},
});
