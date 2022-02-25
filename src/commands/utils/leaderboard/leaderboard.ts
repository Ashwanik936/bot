import {EMBEDCOLOR} from './../../../core/GlobalConstants.js';
import {FrodoClient, Message, Options} from '../../../core/FrodoClient';

import {MessageEmbed} from 'discord.js';

export default async function(this: FrodoClient, message: Message, options: Options) {
	if (!this.firebase.connected) {
		message.edit({
			embeds: [
				new MessageEmbed({
					color: '#ff0000',
					description: 'A malfunction has occured in the database connection. Please try again later. If you think you have found an error, please report it at https://help.frodo.fun',
				}),
			],
		});
		return;
	}
	const game = options.getString('game');
	const embed = new MessageEmbed()
		.setColor(EMBEDCOLOR)
		.setTitle(`${game[0].toUpperCase() + game.slice(1)} Leaderboard`)
		.setTimestamp();

	const leaderboard = await this.firebase.getTopLeaderboard(game);
	const description = [];
	leaderboard.forEach((item, index) => {
		description.push(`${index + 1}. ${item.name} - ${item.score}`);
	});
	embed.setDescription(description.join('\n'));

	message.edit({
		content: `You can see a larger leaderboard at https://frodo.fun/leaderboard#${game}`,
		embeds: [embed],
	});
}
