import {Command} from '../../../core/Command';
import ping from './ping.js';

export const command: Command = {
	name: 'ping',
	description: 'Get Frodo\'s ping',
	version: '1.0.0',
	handler: ping,
};
