import { PermissionFlagsBits } from 'discord.js';
import { SubCommandHandler } from '../../builders/subcommandHandler';
import { createSignup } from './create';
import { removeUserFromSignups } from './remove';
import { getInfoFromCategory } from './info';
import { addUserToSignups } from './add';

import createNewCategory from './create_category';
import deleteCategory from './delete_category';
import editcategory from './editcategory';
import anonymity from './anonymity';

export const signups = new SubCommandHandler('signups')
	.setDescription('Assorted commands to create and manage signups')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.attachSubcommand(createSignup)
	.attachSubcommand(removeUserFromSignups)
	.attachSubcommand(getInfoFromCategory)
	.attachSubcommand(addUserToSignups)
	.attachSubcommand(createNewCategory)
	.attachSubcommand(deleteCategory)
	.attachSubcommand(editcategory)
	.attachSubcommand(anonymity);
