import { genCUID } from '@utils/random';

export enum LogType {
	Error = 'Error',
	Info = 'Info',
	Debug = 'Debug',
	Critical = 'Critical',
	Success = 'Success',
}

export class Logger {
	private cuid: string;
	constructor() {
		this.cuid = genCUID();
	}

	public log(type: LogType, message: string) {
		console.log(`[${type}] [${this.cuid}] ${message}`);
	}
}
