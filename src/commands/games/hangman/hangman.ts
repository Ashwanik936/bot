import {hangmanStages, stopButton} from './variables.js';
import {DmMessageHandler} from './../../../core/ErrorHandling/DmMessageHandler';
import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';
import {ButtonValidate} from '../../../core/ButtonValidate.js';

import {ButtonInteraction, User} from 'discord.js';

export default class Hangman extends CommandBase {
	playerOne: User;
	playerTwo: User;
	players: User[];

	dmMessage: DmMessageHandler;
	word: string[];
	clientWord: string;
	displayWord: string[];
	stage: number;
	wrongGuesses: string[];
	correctGuesses: string[];
	stopped: boolean;

	constructor(options: CommandBaseOptions) {
		super(options);

		const playersList = this.getRandomPlayers(false);
		if (!playersList) return;
		this.players = playersList.randomPlayers;
		this.playerOne = playersList.playerOne;
		this.playerTwo = playersList.playerTwo;

		this.stage = 0;
		this.wrongGuesses = [];
		this.correctGuesses = [];
		this.stopped = false;
		this.runGame();
	}

	async runGame() {
		await this.message.edit(`Waiting for a word to be chosen by ${this.playerOne}`);
		this.dmMessage = await this.sendDm(this.playerOne, 'Please reply with a message for your hangman game!\nIt should be between 1 and 20 characters long and include no spaces.');
		if (!this.dmMessage) return;

		this.clientWord = this.getWordForGame(await this.waitForWord());
		this.word = this.clientWord.toLocaleLowerCase().split('');
		await this.dmMessage.edit(`You chose the word \`${this.clientWord}\``);

		this.displayWord = [];
		for (let i = 0; i < this.word.length; i++) {
			this.displayWord.push('-');
		}
		await this.updateMessage();
		this.runGameLoop();
	}

	async runGameLoop() {
		const input = await this.getInput();
		if (this.stopped) return;
		const letter = input.toLocaleLowerCase().substring(0, 1);
		if (this.wrongGuesses.includes(letter) || this.correctGuesses.includes(letter)) {
			this.runGameLoop();
			return;
		}
		if (this.word.includes(letter)) {
			this.correctGuesses.push(letter);
			const letterIndex = this.getLetterOccurances(letter);
			letterIndex.forEach((index) => {
				this.displayWord[index] = this.clientWord[index];
			});
			if (this.displayWord.join('') === this.clientWord) {
				this.gameOver(true);
				return;
			}
		} else {
			this.wrongGuesses.push(letter);
			this.stage++;
			if (this.stage === hangmanStages.length - 1) {
				this.gameOver(false);
				return;
			}
		}
		await this.updateMessage();
		this.runGameLoop();
	}

	getLetterOccurances(letter: string): number[] {
		const occurances = [];
		this.word.forEach((letterInWord, index) => {
			if (letterInWord === letter) {
				occurances.push(index);
			}
		});
		return occurances;
	}

	async updateMessage() {
		await this.message.edit({
			content: `${this.playerTwo}, please send letters that you think are in the word\nGuess a letter by typing \`.g <letter>\`\n${hangmanStages[this.stage]}\n\n\`${this.displayWord.join('')}\`\nWrong Guesses: \`${this.wrongGuesses.join('') || 'None!'}\``,
			components: [this.makeButtonRow(stopButton)],
		});
	}

	async waitForWord(): Promise<string> {
		const message = (await this.playerOne.dmChannel.awaitMessages({
			filter: () => true,
			max: 1,
		})).first();
		return message.content;
	}

	async getInput(): Promise<string> {
		const message = (await this.message.channel.awaitMessages({
			filter: (message) => message.author.id === this.playerTwo.id && message.content.startsWith('.g '),
			max: 1,
		})).first();
		if (this.stopped) return;
		if (!message) {
			this.sendError(new Error('No message was recived'));
			this.finishCommand();
			this.stopped = true;
			return;
		}
		await message.delete()
			.catch(() => {});
		return message.content.replace('.g ', '');
	}

	getWordForGame(word): string {
		return word.replace(/ /g, '').substring(0, 20);
	}

	async gameOver(win: boolean) {
		this.finishCommand();
		await this.message.edit({
			content: `${hangmanStages[this.stage]}\n\n\`${this.displayWord.join('')}\`\nWrong Guesses: \`${this.wrongGuesses.join('') || 'None!'}\`\n${win ? `${this.playerTwo} beat ${this.playerOne}` : `${this.playerTwo} lost to ${this.playerOne}! The word was \`${this.clientWord}\``}`,
			components: [],
		});
	}

	public onButtonClick(): void {
		this.stopped = true;
		this.message.edit({
			content: `The game was stopped by one of the players!`,
			components: [],
		});
		this.finishCommand();
	}

	public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
		const playerIds = this.players.map((i) => i.id);
		return playerIds.includes(interaction.user.id) ? ButtonValidate.Run : ButtonValidate.Message;
	}
}
