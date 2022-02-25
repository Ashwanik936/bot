import {Button} from './../../../core/Button.d';
import {ButtonValidate} from '../../../core/ButtonValidate.js';
import {EMBEDCOLOR} from '../../../core/GlobalConstants.js';
import {CommandBaseOptions} from '../../../core/CommandBaseOptions';
import CommandBase from '../../../core/CommandBase.js';
import {buttonsRowOne, buttonsRowTwo, gridDimensions, playerTextClear, slotText, SlotType} from './emojis.js';

import {ButtonInteraction, MessageEmbed, User} from 'discord.js';

export default class ConnectFour extends CommandBase {
	players: User[];
	currentPlayer: User;
	grid: SlotType[][];
	isPlayerOne: boolean;
	fullRows: number[];
	numberOfPlays: number;

	playerOne: User;
	playerTwo: User;

	running: boolean;

	constructor(options: CommandBaseOptions) {
		super(options);

		const playersList = this.getRandomPlayers();
		if (!playersList) return;
		this.players = playersList.randomPlayers;
		this.playerOne = playersList.playerOne;
		this.playerTwo = playersList.playerTwo;

		this.currentPlayer = this.players[0];
		this.isPlayerOne = true;
		this.grid = [];
		this.fullRows = [];
		this.numberOfPlays = 0;

		this.running = true;

		this.runGame();
	}

	async runGame() {
		this.generateGrid();
		this.updateMessage();
	}

	generateGrid() {
		for (let i = 0; i < gridDimensions.y; i++) {
			for (let j = 0; j < gridDimensions.x; j++) {
				if (!this.grid[i]) this.grid.push([]);
				this.grid[i].push(SlotType.Empty);
			}
		}
	}

	findFullColumns(): number[] {
		for (let x = 0; x < gridDimensions.x; x++) {
			if (this.fullRows.includes(x)) continue;
			let fullRow = true;
			for (let y = 0; y < gridDimensions.y; y++) {
				if (this.grid[y][x] === SlotType.Empty) {
					fullRow = false;
					break;
				}
			}
			if (fullRow) this.fullRows.push(x);
		}

		return this.fullRows;
	}

	updateMessage() {
		let message = '';
		this.grid.forEach((i: SlotType[]) => {
			i.forEach((j: SlotType) => {
				message += slotText[j];
			});

			message += '\n';
		});

		const buttons: Button[][] = [
			JSON.parse(JSON.stringify(buttonsRowOne)),
			JSON.parse(JSON.stringify(buttonsRowTwo)),
		];

		this.findFullColumns().forEach((column) => {
			buttons[column <= 3 ? 0 : 1][column % 4].disabled = true;
		});

		message += '<:l1:851065666341699584><:l2:851065679682469888><:l3:851065688436899861><:l4:851065697873690654><:l5:851065706735992893><:l6:851065718644801546><:l7:851065729570963456><:l8:851065741817675796>';

		this.message.edit({
			content: `${this.playerOne} challenged ${this.playerTwo} to a game of Connect Four!`,
			embeds: [
				new MessageEmbed()
					.setColor(EMBEDCOLOR)
					.setDescription(`Current go: ${playerTextClear[this.isPlayerOne ? 0 : 1]} ${this.isPlayerOne ? this.players[0] : this.players[1]}\n\n${message}`),
			],
			components: [
				this.makeButtonRow(...buttons[0]),
				this.makeButtonRow(...buttons[1]),
			],
		});
	}

	checkWinWithModifiers(column: number, row: number, columnModifier: number, rowModifier: number) {
		let streak = 0;

		for (let y = -3; y < 4; y++) {
			const rowIndex = row + (y * rowModifier);
			const columnIndex = column + (y * columnModifier);
			const gridValue: SlotType = this.grid[rowIndex]?.[columnIndex];
			if (gridValue === undefined) continue;

			if (gridValue == (this.isPlayerOne ? SlotType.PlayerOne : SlotType.PlayerTwo)) {
				streak++;
				if (streak == 4) return true;
			} else {
				streak = 0;
			}
		}

		return false;
	}

	checkWin(column: number, row: number): boolean {
		return (
			this.checkWinWithModifiers(column, row, 0, 1) ||
			this.checkWinWithModifiers(column, row, 1, 0) ||
			this.checkWinWithModifiers(column, row, 1, 1) ||
			this.checkWinWithModifiers(column, row, 1, -1)
		);
	}

	async finish(win: boolean) {
		this.updateMessageFinish(win);
		this.finishCommand();
	}

	updateMessageFinish(win: boolean) {
		let message = '';
		this.grid.forEach((i: SlotType[]) => {
			i.forEach((j: SlotType) => {
				message += slotText[j];
			});

			message += '\n';
		});

		message += '<:l1:851065666341699584><:l2:851065679682469888><:l3:851065688436899861><:l4:851065697873690654><:l5:851065706735992893><:l6:851065718644801546><:l7:851065729570963456><:l8:851065741817675796>';

		this.message.edit({
			content: `${this.playerOne} challenged ${this.playerTwo} to a game of Connect Four!${win ? `\n\n${this.isPlayerOne ? this.players[0] : this.players[1]} Won!\n` : '\n\nThey Drew!\n'}`,
			embeds: [
				new MessageEmbed()
					.setColor(EMBEDCOLOR)
					.setDescription(`\n${message}`),
			],
			components: [],
		});
	}

	public onButtonClick(buttonId: string): void {
		if (!this.running) return;

		const columnNumber = parseInt(buttonId);
		let rowNumber = gridDimensions.y - 1;
		this.numberOfPlays++;

		for (let i = gridDimensions.y - 1; i >= 0; i--) {
			if (this.grid[i][columnNumber] == SlotType.Empty) {
				this.grid[i][columnNumber] = this.isPlayerOne ? SlotType.PlayerOne : SlotType.PlayerTwo;
				break;
			}

			rowNumber--;
		}

		if (this.checkWin(columnNumber, rowNumber)) {
			this.running = false;
			this.finish(true);
			return;
		} else if (this.numberOfPlays === gridDimensions.x * gridDimensions.y) {
			this.running = false;
			this.finish(false);
			return;
		}

		this.isPlayerOne = !this.isPlayerOne;
		this.currentPlayer = this.isPlayerOne ? this.players[0] : this.players[1];

		this.updateMessage();
	}

	public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
		return this.validateMultiplayerButtonClick(interaction, this.currentPlayer, this.players);
	}
}
