import {FrodoClient, Message, Options} from '../../../core/FrodoClient';
import getCompliment from '../compliment/getCompliment.js';
import getInsult from './getInsult.js';

export default async function(this: FrodoClient, message: Message, options: Options) {
	let text = '';
	if (options.getUser('user')) text = `${options.getUser('user')} :fire: `;

	try {
		let insult = '';
		// Easter egg to send a compliment if the bot is selected
		if (options.getUser('user')?.id === this.user.id) {
			const {compliment} = await getCompliment();
			insult = compliment[0].toUpperCase() + compliment.slice(1);
		} else {
			const insultRequest = await getInsult();
			insult = insultRequest.insult;
		}
		message.edit(`${text}${insult}`);
	} catch (err) {
		message.edit(`We could not find you a insult :confused:`);
	}
}
