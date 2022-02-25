import {Command} from './../../../core/Command.d';
import compliment from './compliment.js';

export const command: Command = {
	name: 'compliment',
	description: 'Compliment yourself or another user',
	options: [
		{
			name: 'user',
			description: 'The user to compliment',
			type: 'USER',
			required: false,
		},
	],
	version: '1.0.0',
	handler: compliment,
};
