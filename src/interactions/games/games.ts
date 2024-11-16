import { PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createGame } from './create';
import { manageGame } from './manage';

export const signups = new SubCommandHandler('games')
	.setDescription('Assorted commands to create and manage games')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createGame)
	.attachSubcommand(manageGame);
