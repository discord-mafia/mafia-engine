import { PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createSignup } from './create';

export const signups = new SubCommandHandler('signups')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createSignup);
