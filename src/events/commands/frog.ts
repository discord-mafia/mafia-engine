import { SlashCommand } from '@structures/interactions/SlashCommand';

const FROG_IMAGES = [
	'https://media.discordapp.net/attachments/1119025192946110464/1192704160777371668/photo-1496070242169-b672c576566b.png?ex=65aa0b4f&is=6597964f&hm=60a46bae1d2f5474a6e7caf1876f20ca7dbaa36444d97f31f2cb36f8259e44ad&=&format=webp&quality=lossless&width=1798&height=1404',
	'https://media.discordapp.net/attachments/1119025192946110464/1192705162435899432/photo-1579380656108-f98e4df8ea62.png?ex=65aa0c3e&is=6597973e&hm=018702f536f1306e538f53b2ca2b72316b1055ee0fc1b8d3d78e610c3dd950cb&=&format=webp&quality=lossless&width=936&height=1404',
	'https://media.discordapp.net/attachments/1119025192946110464/1192708887598600242/photo-1470165344182-24727c18c317.png?ex=65aa0fb6&is=65979ab6&hm=b3a32cd98c23f405ac47d54b0126580b8edb261164da1f01dfc4337dbb94eb0e&=&format=webp&quality=lossless&width=2110&height=1404',
	'https://media.discordapp.net/attachments/1119025192946110464/1192713060465508402/premium_photo-1669865374543-f830ea7d0053.png?ex=65aa1399&is=65979e99&hm=e4acc9f1bbec564de8c8065de08ad9a21b380b140e217dba264f92ee2ed61247&=&format=webp&quality=lossless&width=2106&height=1404',
	'https://media.discordapp.net/attachments/1119025192946110464/1192713138039173242/photo-1598537179958-687e6cc625fb.png?ex=65aa13ab&is=65979eab&hm=21195a9ad8aa44ed5873d23ff57412d296eb15a88c756256b9b5b8f850382ec4&=&format=webp&quality=lossless&width=2106&height=1404',
];

export default new SlashCommand('frog').setDescription('Ribbit.').onExecute(async (i, _ctx) => {
	const randomFrog = FROG_IMAGES[Math.floor(Math.random() * FROG_IMAGES.length)] ?? 'Frog ribbited and jumped away... how sad';
	return i.reply({ content: `${randomFrog}` });
});
