import {EMBEDCOLOR} from '../../../core/GlobalConstants.js';
import {region, buttons, backButton, winButtons} from './emojis.js';
import {CommandBaseOptions} from '../../../core/CommandBaseOptions';
import CommandBase from '../../../core/CommandBase.js';
import {Aki} from 'aki-api';
import {MessageEmbed} from 'discord.js';
import {guess} from 'aki-api/typings/src/functions';

export default class Akinator extends CommandBase {
	aki: Aki;
	currentGuess: number;
	hasWon = false;
	choiceMade: boolean;
	finished: boolean;
	currentTimeoutTime: number;
	inputProcessing: boolean;

	constructor(options: CommandBaseOptions) {
		super(options);

		this.aki = new Aki({region, childMode: false});
		this.choiceMade = false;
		this.finished = false;
		this.currentGuess = 0;
		this.inputProcessing = false;

		this.runGame();
	}

	async runGame() {
		try {
			await this.aki.start();
			await this.updateMessage();
		} catch (err) {
			this.message.edit({
				embeds: [
					new MessageEmbed()
						.setTitle('There was an error when starting the game')
						.setDescription('If this keeps happening, please report the issue at https://help.frodo.fun')
						.setColor('#ff0000'),
				],
			});
			this.finishCommand();
		}
	}

	getTimeTillTimeout(): number {
		const time = Math.round((this.lastButtonClick || Date.now()) / 1000) + 10 * 60;
		this.currentTimeoutTime = time;
		return time;
	}

	async updateMessage() {
		backButton.disabled = this.aki.currentStep === 0;
		await this.message.edit({
			embeds: [
				new MessageEmbed()
					.setTitle('Akinator:')
					.setDescription(`The game will timeout <t:${this.getTimeTillTimeout()}:R>`)
					.setColor(EMBEDCOLOR)
					.setThumbnail('https://frodo.fun/static/img/frodoAssets/aki.png')
					.addFields(
						{name: 'Question:', value: this.aki.question},
						{name: 'Progress:', value: String(this.aki.progress)},
					),
			],
			components: [
				this.makeButtonRow(...buttons),
				this.makeButtonRow(backButton),
			],
		});
	}

	async winStep() {
		await this.updateWinMessage('Am I right?', this.currentGuess);
		this.currentGuess++;
	}

	async updateWinMessage(description: string, i: number) {
		const answers = <guess> this.aki.answers[i];
		let winButtonsOnMessage = JSON.parse(JSON.stringify(winButtons));
		if (this.finished) {
			winButtonsOnMessage = winButtonsOnMessage.map((value) => {
				value.disabled = true;
				return value;
			});
			this.finishCommand();
		}
		await this.message.edit({
			embeds: [
				new MessageEmbed()
					.setTitle('Akinator:')
					.setColor('#3498db')
					.addFields(
						{name: 'Name:', value: answers.name},
						{name: 'Description:', value: answers.description},
					)
					.setImage(answers.absolute_picture_path)
					.setThumbnail('https://frodo.fun/static/img/frodoAssets/aki.png'),
			],
			components: [
				this.makeButtonRow(...winButtonsOnMessage),
			],
			content: description,
		});
	}

	public async onButtonClick(id) {
		if (this.finished || this.inputProcessing) return;

		if (id > 10) {
			if (id == 11) {
				this.finished = true;
				this.updateWinMessage('I win again!', this.currentGuess - 1);
				this.choiceMade = true;
			} else if (id == 12) {
				if (this.currentGuess < this.aki.guessCount && !this.choiceMade) {
					await this.winStep();
				} else {
					this.finished = true;
					await this.updateWinMessage('I don\'t know, you win!', this.aki.guessCount - 1);
				}
			}
			return;
		} else {
			if (this.currentTimeoutTime < Math.round(Date.now() / 1000)) {
				this.message.edit({
					embeds: [
						new MessageEmbed()
							.setTitle('Akinator:')
							.setDescription('The game timed out! Please run `/akinator` again')
							.setColor(EMBEDCOLOR)
							.setThumbnail('https://frodo.fun/static/img/frodoAssets/aki.png'),
					],
					components: [],
					content: ' ',
				});
				this.finishCommand();
				return;
			}
			this.inputProcessing = true;
			if (id == 5) {
				await this.aki.back();
			} else {
				await this.aki.step(id);
			}
			this.inputProcessing = false;
		}

		if (this.aki.progress >= 75 || this.aki.currentStep >= 78) {
			await this.aki.win()
				.catch(() => {
					this.message.edit({
						embeds: [
							new MessageEmbed()
								.setTitle('Akinator:')
								.setDescription('We don\'t know who you were thinking of! You win!')
								.setColor(EMBEDCOLOR)
								.setThumbnail('https://frodo.fun/static/img/frodoAssets/aki.png'),
						],
						components: [],
						content: ' ',
					});
					this.finishCommand();
					return;
				});
			if (!this.gameIsActive) return;
			this.hasWon = true;
			await this.winStep();
			return;
		} else {
			await this.updateMessage();
		}
	}
}
