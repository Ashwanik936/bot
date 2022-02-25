import {Button} from './../../../core/Button.d';
import {User, MessageActionRow, ButtonInteraction} from 'discord.js';

import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';
import {GridPlace, GridDimensions} from './types.js';
import {makeTttGrid} from './tttUtils.js';
import {ButtonValidate} from '../../../core/ButtonValidate';

export default class Ttt extends CommandBase {
	playerOne: User;
	playerTwo: User;
	players: User[];

	grid: GridPlace[][];
	isPlayerOne: boolean;
	currentPlayer: User;
	gridDimensions: GridDimensions;
	countToWin: number;

	constructor(options: CommandBaseOptions) {
		super(options);

		const playersList = this.getRandomPlayers();
		if (!playersList) return;
		this.players = playersList.randomPlayers;
		this.playerOne = playersList.playerOne;
		this.playerTwo = playersList.playerTwo;

		const size = Number(this.options.getString('size'));
		this.gridDimensions = {
			width: size || 3,
			height: size || 3,
		};

		const countToWin = Number(this.options.getString('counttowin'));
		this.countToWin = countToWin || size || 3;

		if (this.countToWin > this.gridDimensions.width) {
			this.message.edit('Count to win cannot be greater than the grid size!');
			return;
		}

		this.isPlayerOne = true;
		this.currentPlayer = this.players[0];
		this.grid = makeTttGrid(this.gridDimensions.width, this.gridDimensions.height);
		this.updateNormalMessage();
	}

	checkWinWithModifiers(column: number, row: number, columnModifier: number, rowModifier: number) {
		let streak = 0;

		for (let y = -this.countToWin; y < this.countToWin; y++) {
			const rowIndex = row + (y * rowModifier);
			const columnIndex = column + (y * columnModifier);
			const gridValue: GridPlace = this.grid[rowIndex]?.[columnIndex];
			if (gridValue === undefined) continue;

			if (gridValue == (this.isPlayerOne ? GridPlace.PlayerOne : GridPlace.PlayerTwo)) {
				streak++;
				if (streak == this.countToWin) return true;
			} else {
				streak = 0;
			}
		}

		return false;
	}

	getMessageButtons(disabled?: boolean): MessageActionRow[] {
		const buttons: MessageActionRow[] = [];
		this.grid.forEach((row, rowI) => {
			const rowButtons: Button[] = [];
			row.forEach((cell, cellI) => {
				rowButtons.push({
					label: cell === GridPlace.Empty ? ' ' : cell === GridPlace.PlayerOne ? 'X' : 'O',
					id: `${rowI}-${cellI}`,
					disabled: disabled || cell !== GridPlace.Empty,
					style: cell === GridPlace.Empty ? 'SECONDARY' : cell === GridPlace.PlayerOne ? 'PRIMARY' : 'SUCCESS',
				});
			});
			buttons.push(this.makeButtonRow(...rowButtons));
		});
		return buttons;
	}

	async updateMessage(extension: string, buttonsDisabled: boolean = false) {
		await this.message.edit({
			content: `${this.playerOne} challenged ${this.playerTwo} to a game of ttt!\nCount To Win: \`${this.countToWin}\`\n\n${extension}`,
			components: this.getMessageButtons(buttonsDisabled),
		});
	}

	async updateNormalMessage() {
		await this.updateMessage(`${this.currentPlayer}'s (${this.isPlayerOne ? 'X' : 'O'}) turn!`);
	}

	checkForWin(column, row): boolean {
		return (
			this.checkWinWithModifiers(column, row, 0, 1) ||
			this.checkWinWithModifiers(column, row, 1, 0) ||
			this.checkWinWithModifiers(column, row, 1, 1) ||
			this.checkWinWithModifiers(column, row, 1, -1)
		);
	}

	checkForDraw(): boolean {
		return this.grid.every((row) => row.every((cell) => cell !== GridPlace.Empty));
	}

	switchPlayer() {
		this.isPlayerOne = !this.isPlayerOne;
		this.currentPlayer = this.isPlayerOne ? this.players[0] : this.players[1];
	}

	public onButtonClick(buttonId: string): void {
		const [row, column] = buttonId.split('-').map(Number);
		this.grid[row][column] = this.isPlayerOne ? GridPlace.PlayerOne : GridPlace.PlayerTwo;

		if (this.checkForWin(column, row)) {
			this.updateMessage(`${this.currentPlayer} Won!`, true);
			return;
		}

		if (this.checkForDraw()) {
			this.updateMessage(`They drew!`, true);
			return;
		}

		this.switchPlayer();
		this.updateNormalMessage();
	}

	public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
		return this.validateMultiplayerButtonClick(interaction, this.currentPlayer, this.players);
	}
}
