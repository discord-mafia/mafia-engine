import { PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createSignup } from './create';
import { addUserToSignups } from './add';
import { removeUserFromSignups } from './remove';

export const signups = new SubCommandHandler('signups')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createSignup)
	.attachSubcommand(addUserToSignups)
	.attachSubcommand(removeUserFromSignups);
