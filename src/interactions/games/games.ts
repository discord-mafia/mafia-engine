import { PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createGame } from './create';

export const signups = new SubCommandHandler('games')
	.setDescription('Assorted commands to create and manage games')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createGame);
