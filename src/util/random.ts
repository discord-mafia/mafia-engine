let cuidCounter = 0;
export function genCUID() {
	const hexTimestamp = (new Date().getTime() / 1000).toString(16);
	const hexRandom = Math.floor(Math.random() * 0x100000000).toString(16);
	const cuid = (hexTimestamp + cuidCounter.toString(16) + hexRandom).substring(0, 8).padEnd(8, '0');
	cuidCounter = (cuidCounter + 1) % 0x100;
	return cuid.toUpperCase();
}
