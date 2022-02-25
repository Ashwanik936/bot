import {Command} from '../../../core/Command';
import insult from './insult.js';

export const command: Command = {
	name: 'insult',
	description: 'Sends a random insult',
	options: [
		{
			name: 'user',
			description: 'The user to insult (Try insulting me!)',
			type: 'USER',
			required: false,
		},
	],
	version: '1.0.2',
	handler: insult,
};
