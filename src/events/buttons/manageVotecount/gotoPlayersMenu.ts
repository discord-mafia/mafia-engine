import { type ButtonInteraction, type CacheType, type ButtonBuilder, type BaseMessageOptions, EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { manageVoteCountEmbeds } from './goHome';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter, type FullVoteCount } from '../../../util/database';
import AddPlayersButton from './players/addPlayers';
import GoHomeButton, { generateBaseVcMenu } from './goHome';
import RemovePlayersButton from './players/removePlayers';
import ReplacePlayersButton from './players/replacePlayer';
import SyncRolePlayersButton from './players/syncRole';

export default class ManagePlayersButton extends CustomButton {
	static customId = 'manage-vc-players-tab';
	constructor() {
		super(ManagePlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(manageVoteCountEmbeds.create());
		const payload = generateManagePlayersEmbed(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Manage Players');
	}
}

export function generateManagePlayersEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return manageVoteCountEmbeds.create();
	const { embeds } = generateBaseVcMenu(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();

	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	const addPlayersButton = CustomButton.getButtonOrThrow(AddPlayersButton.customId);
	const removePlayersButton = CustomButton.getButtonOrThrow(RemovePlayersButton.customId);
	const replacePlayerButton = CustomButton.getButtonOrThrow(ReplacePlayersButton.customId);
	const syncRoleButton = CustomButton.getButtonOrThrow(SyncRolePlayersButton.customId);

	row.addComponents(
		homeButton.generateButton(),
		addPlayersButton.generateButton(),
		removePlayersButton.generateButton(),
		replacePlayerButton.generateButton(),
		syncRoleButton.generateButton()
	);

	return {
		embeds,
		components: [row],
	};
}

export function generatePlaceholder(vc?: FullVoteCount): BaseMessageOptions {
	if (!vc) return manageVoteCountEmbeds.create();

	const embed = new EmbedBuilder();
	embed.setTitle('PLACEHOLDER');
	embed.setDescription(`This menu has not been created yet`);
	embed.setColor('Yellow');

	const row = new ActionRowBuilder<ButtonBuilder>();

	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	row.addComponents(homeButton.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}
