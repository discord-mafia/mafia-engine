import { ButtonInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createSignup } from './create';
import { removeUserFromSignups } from './remove';
import { Event } from '../../builders/event';
import { getHydratedSignup } from '../../db/signups';
import { formatSignupComponents, formatSignupEmbed } from '../../views/signup';
import { getInfoFromCategory } from './info';
import { addUserToSignups } from './add';

export const signups = new SubCommandHandler('signups')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createSignup)
	.attachSubcommand(removeUserFromSignups)
	.attachSubcommand(getInfoFromCategory)
	.attachSubcommand(addUserToSignups);
