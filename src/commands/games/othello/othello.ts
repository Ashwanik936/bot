import {MessageEmbed, User, MessageActionRow, ButtonInteraction} from 'discord.js';

import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';
import {Button} from './../../../core/Button.d';
import {
	clearPlayerEmojis,
	GridPlace,
	tipEmojis,
	gridEmojis,
	defaultStringGrid,
	letterButtons,
	numberButtons,
	tipButton,
	controlButtons,
	HelpGridPlace,
	GridCheck,
	allDirections,
	SpaceStatus,
	CounterCounts,
} from './emoji.js';
import {getOtherPlayerSpace, getPlayerHelpSpace, getPlayerSpace, makeOthelloGrid, makeOthelloHelpGrid, makeTakenRows, makeTakenSpaces} from './othelloUtils.js';
import {ButtonValidate} from '../../../core/ButtonValidate.js';

export default class Othello extends CommandBase {
	playerOne: User;
	playerTwo: User;
	players: User[];

	grid: GridPlace[][];
	helpGrid: HelpGridPlace[][];
	playersGo: number;
	row: number;
	column: number;
	playing: boolean;
	help: boolean;
	tipsEmojis: string[];
	stage: 'letters' | 'numbers' | 'control';
	takenSpaces: SpaceStatus[][];
	takenRows: SpaceStatus[];

	constructor(options: CommandBaseOptions) {
		super(options);

		const playersList = this.getRandomPlayers();
		if (!playersList) return;
		this.players = playersList.randomPlayers;
		this.playerOne = playersList.playerOne;
		this.playerTwo = playersList.playerTwo;

		this.help = this.options.getBoolean('showmoves');
		this.playersGo = 0;
		this.playing = true;
		this.stage = 'letters';
		this.runGame();
	}

	async runGame() {
		this.grid = makeOthelloGrid(8, 8);
		this.helpGrid = makeOthelloHelpGrid(8, 8, true);
		this.tipsEmojis = tipEmojis(this.help);
		this.takenSpaces = makeTakenSpaces(8, 8);
		this.takenRows = makeTakenRows(8);
		await this.updateMessage();
	}

	/**
	 * Generates a string of the grid with the current state
	 * @return {string} The string representation of the grid using Discord emojis
	 */
	stringGrid(): string {
		const grid: (string | GridPlace)[][] = defaultStringGrid;
		this.grid.forEach((row, rowNumber) => {
			row.forEach((value, columnNumber) => {
				if (value === GridPlace.Empty) {
					grid[rowNumber + 1][columnNumber + 1] = this.tipsEmojis[this.helpGrid[rowNumber][columnNumber]];
				} else {
					grid[rowNumber + 1][columnNumber + 1] = gridEmojis[value];
				};
			});
		});

		return grid.map((part) => part.join('')).join('\n');
	}

	/**
	 * Loops through the current grid and clears any selected slots
	 */
	clearGridSelection() {
		this.grid.forEach((row, rowIndex) => {
			row.forEach((value, columnIndex) => {
				if (value === GridPlace.Selected) this.grid[rowIndex][columnIndex] = GridPlace.Empty;
				if (this.helpGrid[rowIndex][columnIndex] === HelpGridPlace.PlayerOneSelected || this.helpGrid[rowIndex][columnIndex] === HelpGridPlace.PlayerTwoSelected) {
					this.helpGrid[rowIndex][columnIndex] -= 2;
				};
			});
		});
	};

	/**
	 * Updates the message on discord with relevant information
	 * @param {string} [messageExtension] Any extra text to be added to the message
	 */
	async updateMessage(messageExtension?: string) {
		const counts = this.getPlayerCounts();
		await this.message.edit({
			content: `${this.playerOne} challenged ${this.playerTwo} to a game of othello!${messageExtension ? `\n${messageExtension}` : ''}`,
			embeds: [
				new MessageEmbed()
					.setColor('#78B159')
					.setFooter({text: `${this.players[0].username}: ${counts.black}, ${this.players[1].username}: ${counts.white}`})
					.setDescription(`Current go: ${clearPlayerEmojis[this.playersGo]} <@${this.players[this.playersGo].id}>\n\n${this.stringGrid()}`),
			],
			components: this.getMessageButtons(),
		});

		return true;
	}

	/**
	 * Returns an array of buttons in MessageActionRow form to be displayed on the message
	 * @return {MessageActionRow[]} An array of buttons to be displayed on the message
	 */
	getMessageButtons(): MessageActionRow[] {
		const buttons: MessageActionRow[] = [];

		switch (this.stage) {
		case 'letters':
			const updatedLetterButtons: Button[][] = JSON.parse(JSON.stringify(letterButtons));
			this.takenRows.forEach((taken, index) => {
				if (taken === SpaceStatus.Taken) updatedLetterButtons[index <= 3 ? 0 : 1][index % 4].disabled = true;
			});
			if (this.help) {
				this.helpGrid.forEach((row, rowIndex) => {
					let disable = true;
					row.forEach((value) => {
						if (value !== HelpGridPlace.Empty) disable = false;
					});
					updatedLetterButtons[rowIndex <= 3 ? 0 : 1][rowIndex % 4].disabled = disable;
				});
			}
			buttons.push(this.makeButtonRow(...updatedLetterButtons[0]), this.makeButtonRow(...updatedLetterButtons[1]));
			break;
		case 'numbers':
			const updatedNumberButtons = JSON.parse(JSON.stringify(numberButtons));
			this.takenSpaces[this.row].forEach((value, columnIndex) => {
				if (value === SpaceStatus.Taken) {
					updatedNumberButtons[columnIndex <= 3 ? 0 : 1][columnIndex % 4].disabled = true;
				}
			});
			if (this.help) {
				this.helpGrid[this.row].forEach((value, columnIndex) => {
					if (value === HelpGridPlace.Empty) {
						updatedNumberButtons[columnIndex <= 3 ? 0 : 1][columnIndex % 4].disabled = true;
					};
				});
			}
			buttons.push(this.makeButtonRow(...updatedNumberButtons[0]), this.makeButtonRow(...updatedNumberButtons[1]));
			break;
		case 'control':
			buttons.push(this.makeButtonRow(...controlButtons[0]));
			break;
		}
		buttons.push(this.makeButtonRow(tipButton(this.help)));

		return buttons;
	}

	changePlayer() {
		this.playersGo = this.playersGo === 0 ? 1 : 0;
	}

	getPlayerCounts(): CounterCounts {
		let black = 0;
		let white = 0;

		this.grid.forEach((row) => {
			row.forEach((value) => {
				if (value === GridPlace.PlayerOne) black++;
				else if (value === GridPlace.PlayerTwo) white++;
			});
		});

		return {
			black,
			white,
		};
	}

	/**
	 * Checks if the given move is valid and if yes, gives a list of all possible moves
	 * @param {number} row The row of the move
	 * @param {number} column The column of the move
	 * @return {GridCheck} The result of the move
	 */
	checkGrid(row: number, column: number): GridCheck {
		let canPlay = false;
		const playableDirections = [];
		if (this.grid[row][column] !== GridPlace.Empty) return {canPlay: false};

		allDirections.forEach((dir) => {
			let pos = [row, column];
			if (!this.grid[row + dir[0]]?.[column + dir[1]] || this.grid[row + dir[0]][column + dir[1]] !== getOtherPlayerSpace(this.playersGo)) return;
			for (let i = 0; i < 8; i++) {
				pos = [pos[0] + dir[0], pos[1] + dir[1]];
				if (!this.grid[pos[0]]?.[pos[1]] || this.grid[pos[0]][pos[1]] === GridPlace.Empty) return;
				if (i !== 0 && this.grid[pos[0]][pos[1]] === getPlayerSpace(this.playersGo)) {
					canPlay = true;
					playableDirections.push(dir);
					continue;
				};
			};
		});

		return {
			canPlay,
			playableDirections,
		};
	};

	makeRowSelection() {
		this.grid[this.row].forEach((value, columnNumber) => {
			if (this.helpGrid[this.row][columnNumber] && value === GridPlace.Empty) {
				this.helpGrid[this.row][columnNumber] += 2;
			} else if (value === GridPlace.Empty) {
				this.grid[this.row][columnNumber] = 3;
			};
		});
		this.stage = 'numbers';
	}

	makeColumnSelection() {
		if (this.helpGrid[this.row][this.column] && this.grid[this.row][this.column] === GridPlace.Empty) {
			this.helpGrid[this.row][this.column] += 2;
		} else if (this.grid[this.row][this.column] === GridPlace.Empty) {
			this.grid[this.row][this.column] = GridPlace.Selected;
		}
		this.stage = 'control';
	}

	checkIfColumnTaken(): boolean {
		for (const value of this.grid[this.row]) {
			if (value !== GridPlace.PlayerOne && value !== GridPlace.PlayerTwo) return false;
		}
		return true;
	}

	/**
	 * This function returns all possible moves for the current player
	 * @return {GridCheck} The options for the player
	 */
	getPossibleMovesForPlayer(): GridCheck {
		let canPlay = false;
		const playablePlaces = [];

		this.grid.forEach((row, rowIndex) => {
			row.forEach((value, columnIndex) => {
				if (value !== GridPlace.Empty) return;
				if (this.checkGrid(rowIndex, columnIndex).canPlay) {
					playablePlaces.push([rowIndex, columnIndex]);
					canPlay = true;
				};
			});
		});

		return {
			canPlay,
			playablePlaces,
		};
	}

	/**
	 * @return {boolean} Whether the move was valid or not
	 */
	makePlay(): boolean {
		const gridCheck: GridCheck = this.checkGrid(this.row, this.column);
		if (!gridCheck.canPlay) return false;
		gridCheck.playableDirections.forEach((dir) => {
			let pos = [this.row, this.column];
			for (let i = 0; i < 8; i++) {
				pos = [pos[0] + dir[0], pos[1] + dir[1]];
				const value = this.grid[pos[0]]?.[pos[1]];
				if (!value || value === getPlayerSpace(this.playersGo)) return;
				if (value === getOtherPlayerSpace(this.playersGo)) {
					this.grid[pos[0]][pos[1]] = getPlayerSpace(this.playersGo);
				};
			};
		});
		this.grid[this.row][this.column] = getPlayerSpace(this.playersGo);
		this.takenSpaces[this.row][this.column] = SpaceStatus.Taken;
		if (this.checkIfColumnTaken()) this.takenRows[this.row] = SpaceStatus.Taken;

		this.changePlayer();
		this.helpGrid = makeOthelloHelpGrid(8, 8);
		const playersMove: GridCheck = this.getPossibleMovesForPlayer();

		if (playersMove.canPlay) {
			playersMove.playablePlaces.forEach((move) => {
				this.helpGrid[move[0]][move[1]] = getPlayerHelpSpace(this.playersGo);
			});
		} else {
			this.changePlayer();
			const otherPlayersMove: GridCheck = this.getPossibleMovesForPlayer();
			if (otherPlayersMove.canPlay) {
				otherPlayersMove.playablePlaces.forEach((move) => {
					this.helpGrid[move[0]][move[1]] = getPlayerHelpSpace(this.playersGo);
				});
			} else {
				this.gameOver();
			}
		}

		return true;
	}

	/**
	 * Run when the game is over
	 */
	gameOver() {
		this.playing = false;
		const {black, white} = this.getPlayerCounts();

		let text = '';
		if (black === white) text = 'You Drew!';
		else if (black > white) text = `<@${this.players[0].id}> Won!`;
		else if (white > black) text = `<@${this.players[1].id}> Won!`;

		this.message.edit({
			content: text,
			embeds: [
				new MessageEmbed()
					.setColor('#78B159')
					.setFooter({text: `${this.players[0].username}: ${black}, ${this.players[1].username}: ${white}`})
					.setDescription(`\n${this.stringGrid()}`),
			],
			components: [],
		});

		this.finishCommand();
	}

	public onButtonClick(buttonId: string): void {
		if (!this.playing) return;

		if (buttonId === 'tip') {
			this.help = !this.help;
			this.tipsEmojis = tipEmojis(this.help);
			this.updateMessage();
			return;
		}

		this.clearGridSelection();
		if (this.stage === 'letters') {
			this.row = parseInt(buttonId);
			this.makeRowSelection();
		} else if (this.stage === 'numbers') {
			this.column = parseInt(buttonId);
			this.makeColumnSelection();
		} else if (this.stage === 'control') {
			const action: number = parseInt(buttonId);
			if (action === 0) {
				const succesfulPlay = this.makePlay();
				this.row = undefined;
				this.column = undefined;
				this.stage = 'letters';
				if (!succesfulPlay) {
					this.updateMessage(`${this.players[this.playersGo]} You can't play there! Try pressing the 💡 button to see where you can go`);
					return;
				}
				if (!this.playing) return;
			} else if (action === 1) {
				this.row = undefined;
				this.column = undefined;
				this.stage = 'letters';
			}
		}

		if (this.playing) this.updateMessage();
	}

	public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
		const playerIds = this.players.map((i) => i.id);
		if (buttonId === 'tip' && playerIds.includes(interaction.user.id)) return ButtonValidate.Run;
		if (interaction.user === this.players[this.playersGo]) return ButtonValidate.Run;
		if (playerIds.includes(interaction.user.id)) return ButtonValidate.Ignore;
		return ButtonValidate.Message;
	}
}
