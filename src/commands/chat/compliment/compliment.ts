import {FrodoClient, Message, Options} from '../../../core/FrodoClient';
import getCompliment from './getCompliment.js';

export default async function(this: FrodoClient, message: Message, options: Options) {
	let text = '';
	if (options.getUser('user')) text = `${options.getUser('user')} :hugging: `;

	try {
		const {compliment} = await getCompliment();
		message.edit(`${text}${compliment[0].toUpperCase() + compliment.slice(1)}`);
	} catch (err) {
		message.edit(`We could not find you a compliment :confused:`);
	}
}
