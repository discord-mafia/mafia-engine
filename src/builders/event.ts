export class Event<T> {
	private listeners = new Set<(data: T) => Promise<unknown>>();
	constructor() {}
	public subscribe(fn: (data: T) => Promise<unknown>) {
		this.listeners.add(fn);
		return this;
	}
	public async publish(data: T) {
		for (const listener of this.listeners) {
			await listener(data);
		}
	}
}
