import {ButtonInteraction, CacheType, User} from 'discord.js';

import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';
import {emojis, playerOneButtons, WinOutcome, WinScenarios} from './buttons.js';
import {ButtonValidate} from '../../../core/ButtonValidate.js';

export default class Rps extends CommandBase {
	playerOne: User;
	playerTwo: User;
	players: User[];

	playerOneMove: string;
	playerTwoMove: string;

	constructor(options: CommandBaseOptions) {
		super(options);

		const playersList = this.getRandomPlayers(false);
		if (!playersList) return;
		this.players = playersList.randomPlayers;
		this.playerOne = playersList.playerOne;
		this.playerTwo = playersList.playerTwo;

		this.updateMessage();
	}

	async updateMessage() {
		await this.message.edit({
			content: `${this.playerOne} challenged ${this.playerTwo} to a game of rock paper scissors!\n\n${this.playerOne.username}: \`${this.playerOneMove ? 'Played' : 'Waiting'}\`\n${this.playerTwo.username}: \`${this.playerTwoMove ? 'Played' : 'Waiting'}\``,
			components: [
				this.makeButtonRow(...playerOneButtons),
			],
		});
	}

	getWinOutcome(playerOneMove: string, playerTwoMove: string): WinOutcome {
		return WinScenarios[`${playerOneMove}${playerTwoMove}`];
	}

	updateWinMessage(winMessage: string) {
		this.message.edit({
			content: `${this.playerOne} - ${emojis[this.playerOneMove]}\n${this.playerTwo} - ${emojis[this.playerTwoMove]}\n\n${winMessage}`,
			components: [],
		});
	}

	public onButtonClick(buttonId: string, user: User): void {
		if (user.id === this.playerOne.id) {
			this.playerOneMove = buttonId;
		} else if (user.id === this.playerTwo.id) {
			this.playerTwoMove = buttonId;
		}

		if (this.playerOneMove && this.playerTwoMove) {
			const result = this.getWinOutcome(this.playerOneMove, this.playerTwoMove);
			switch (result) {
			case WinOutcome.Draw:
				this.updateWinMessage(`It's a draw!`);
				break;
			case WinOutcome.PlayerOne:
				this.updateWinMessage(`${this.playerOne} wins!`);
				break;
			case WinOutcome.PlayerTwo:
				this.updateWinMessage(`${this.playerTwo} wins!`);
				break;
			}
			this.finishCommand();
			return;
		}

		this.updateMessage();
	}

	public validateButtonClick(buttonId: string, interaction: ButtonInteraction<CacheType>): ButtonValidate {
		if (!this.playerOneMove && interaction.user.id === this.playerOne.id) return ButtonValidate.Run;
		if (!this.playerTwoMove && interaction.user.id === this.playerTwo.id) return ButtonValidate.Run;
		const userIds = this.players.map((user) => user.id);
		return userIds.includes(interaction.user.id) ? ButtonValidate.Ignore : ButtonValidate.Message;
	}
}
