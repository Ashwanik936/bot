import {Command} from './../../../core/Command.d';
import rps from './rps.js';

export const command: Command = {
	name: 'rps',
	description: 'Play Rock Paper Scissors with someone',
	options: [
		{
			name: 'playertwo',
			description: 'The user to play against',
			type: 'USER',
			required: true,
		},
	],
	version: '1.0.0',
	handler: rps,
};
