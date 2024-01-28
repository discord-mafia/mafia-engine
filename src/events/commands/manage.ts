import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { CustomError } from '@utils/errors';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { anonEmbedMainPage, embedCreateAnonymousGroup } from '@views/anonymity';
import { getAnonymousGroup } from '@models/anonymity';

export default new SlashCommand('manage')
	.setDescription('Manage an part of the bot')
	.set((cmd) => {
		cmd.addSubcommand((sub) => sub.setName('votecount').setDescription('Manage the votecounter in this channel'));
		cmd.addSubcommand((sub) => sub.setName('autolocker').setDescription('Manage the autolocker in this channel'));
		cmd.addSubcommand((sub) => sub.setName('anonymity').setDescription('Manage the anonymity in this channel'));
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
	})
	.onExecute(async (i) => {
		if (!i.guild) return;
		const subcommand = i.options.getSubcommand(true);

		const channel = await i.guild.channels.fetch(i.channelId);
		if (!channel || channel.type != ChannelType.GuildText)
			return i.reply({
				content: 'This channel is not a text channel OR this channel is not recognized by the bot',
				ephemeral: true,
			});

		const canManageChannel = channel.permissionsFor(i.user.id)?.has('ManageChannels');
		if (!canManageChannel)
			return i.reply({
				content: 'You do not have the required permissions in this channel to use this command',
				ephemeral: true,
			});

		try {
			switch (subcommand) {
				case 'votecount': {
					const vc = (await getVoteCounter({ channelId: i.channelId })) ?? undefined;
					if (!vc) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
					const payload = genVoteCountEmbed(vc);
					return i.reply({ ...payload, ephemeral: true });
				}

				case 'autolocker':
					return i.reply({
						content: 'Autolocker',
						ephemeral: true,
					});

				case 'anonymity': {
					const group = await getAnonymousGroup(i.channelId);
					const payload = group ? await anonEmbedMainPage(group) : embedCreateAnonymousGroup();
					return await i.reply({ ...payload, ephemeral: true });
				}
				default:
					return i.reply({
						content: 'Unknown subcommand',
						ephemeral: true,
					});
			}
		} catch (err) {
			console.log(err);

			if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
			else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
			else console.log(err);
		}
	});
