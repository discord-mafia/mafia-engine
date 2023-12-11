import { SlashCommandBuilder } from 'discord.js';
import { newSlashCommand, ServerType } from '@structures/interactions/OldSlashCommand';
import { prisma } from '../..';
import { getCitizenship } from '@models/citizenship';

const data = new SlashCommandBuilder().setName('enroll').setDescription('Enroll a member into our citizenship');
data.addStringOption((opt) => opt.setName('name').setDescription('The name to register this member under').setRequired(true));
data.addUserOption((opt) => opt.setName('member').setDescription('The member to enroll').setRequired(false));
data.addStringOption((opt) =>
	opt.setName('discordid').setDescription('The Discord ID to use for enrollment. Use the member option if you can').setRequired(false)
);
data.addBooleanOption((opt) => opt.setName('renaming').setDescription('Force a name change if the member already exists').setRequired(false));

export default newSlashCommand({
	data,
	serverType: [ServerType.MAIN],
	execute: async (i) => {
		if (!i.guild) return;

		const focusedMember = await i.guild.members.fetch(i.user.id);
		if (!focusedMember) return i.reply({ content: 'You must be in a guild to use this command', ephemeral: true });

		const member = i.options.getUser('member', false);
		const requestedID = i.options.getString('discordid', false);
		const name = i.options.getString('name', true);
		const isRenaming = i.options.getBoolean('renaming', false) ?? false;

		const discordId = member ? member.id : requestedID;
		if (!discordId) return i.reply({ content: 'You must provide a member or a Discord ID', ephemeral: true });

		const fetchedUser = await getCitizenship({ discordId });
		if (fetchedUser && !isRenaming) return i.reply({ content: 'This user is already enrolled', ephemeral: true });
		if (isRenaming && !fetchedUser) return i.reply({ content: 'This user is not enrolled and cannot be renamed', ephemeral: true });
		if (isRenaming && !focusedMember.permissions.has('Administrator'))
			return i.reply({ content: 'You must be an administrator to rename a user', ephemeral: true });

		const fetchedCitizen = await getCitizenship({ name });
		if (fetchedCitizen) return i.reply({ content: 'This name is already taken', ephemeral: true });

		try {
			if (!isRenaming) {
				const citizen = await prisma.user.create({
					data: {
						discordId: discordId,
						username: name,
					},
				});
				return i.reply({ content: `Enrolled <@${citizen.discordId}> as ${citizen.username}`, ephemeral: true });
			}

			const citizen = await prisma.user.update({
				where: {
					discordId: discordId,
				},
				data: {
					username: name,
				},
			});
			return i.reply({ content: `Renamed <@${citizen.discordId}> to ${citizen.username}`, ephemeral: true });
		} catch (err) {
			console.log(err);
			return i.reply({ content: 'Something went wrong', ephemeral: true });
		}
	},
});
