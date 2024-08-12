import { PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../structures/interactions/SlashCommand';
import fs from 'fs';
import { client } from '../../controllers/botController';

export default new SlashCommand('test')
	.setDescription('Test')
	.set((cmd) => {
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	})
	.onExecute(async (i) => {
		await i.deferReply();
		await i.deleteReply();
		const filePath = 'res/icon.gif';
		fs.readFile(filePath, async (err, data) => {
			if (err) {
				console.error('Error reading file:', err);
				return;
			}
			await client.user?.setAvatar(data);
		});
	});
