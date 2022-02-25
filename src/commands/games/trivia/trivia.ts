import {EMBEDCOLOR} from './../../../core/GlobalConstants.js';
import {Button} from './../../../core/Button.d';
import {ApiResponse, Question} from './type.d';
import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';
import getJson from '../../../core/GetJson.js';
import {LeaderboardItem} from '../../../core/leaderboardItem.js';

import {MessageEditOptions, MessageEmbed, User} from 'discord.js';

export default class Trivia extends CommandBase {
	difficulty: string;
	category: string;
	url: string;
	question: Question;
	questionOptions: string[];
	answer: number;
	error: boolean;
	buttons: Button[];

	constructor(options: CommandBaseOptions) {
		super(options);
		this.error = false;
		this.difficulty = this.options.getString('difficulty');
		this.category = this.options.getString('category');
		this.url = 'https://opentdb.com/api.php?amount=1&encode=url3986';
		if (this.difficulty) this.url += `&difficulty=${this.difficulty}`;
		if (this.category) this.url += `&category=${this.category}`;
		this.start();
	}

	sendErrorEmbed() {
		this.finishCommand();
		this.error = true;
		this.message.edit({
			embeds: [
				new MessageEmbed()
					.setColor('RED')
					.setTitle('Trivia Error')
					.setDescription('An error occured while fetching the question please try again. If you think you have found a bug, please report it at https://help.frodo.fun'),
			],
		});
	}

	async fetchQuestion() {
		try {
			const res = await getJson<ApiResponse>(this.url);
			if (res.response_code !== 0) {
				this.sendErrorEmbed();
				return;
			}
			const newQuestion = res.results[0];
			newQuestion.difficulty = decodeURIComponent(newQuestion.difficulty);
			newQuestion.category = decodeURIComponent(newQuestion.category);
			newQuestion.question = decodeURIComponent(newQuestion.question);
			newQuestion.correct_answer = decodeURIComponent(newQuestion.correct_answer);
			newQuestion.incorrect_answers = newQuestion.incorrect_answers.map((answer) => decodeURIComponent(answer));
			if (newQuestion.correct_answer.length > 80 || newQuestion.incorrect_answers.some((answer) => answer.length > 80)) {
				return this.fetchQuestion();
			}
			this.question = newQuestion;
		} catch (e) {
			this.sendErrorEmbed();
			return;
		}
	}

	async start() {
		await this.fetchQuestion();
		if (this.error) return;

		if (this.question.type === 'boolean') {
			this.questionOptions = [
				`True`,
				`False`,
			];
			this.answer = this.question.correct_answer === 'True' ? 0 : 1;
			this.buttons = [
				{
					label: this.questionOptions[0],
					id: '0',
				},
				{
					label: this.questionOptions[1],
					id: '1',
				},
			];
		} else {
			const ranQ = Math.round(Math.random() * 3);
			this.answer = ranQ;
			let currentAnswer = 0;
			this.questionOptions = [];
			this.questionOptions[ranQ] = this.question.correct_answer;
			for (let i = 0; i < 4; i++) {
				if (!this.questionOptions[i]) this.questionOptions[i] = this.question.incorrect_answers[currentAnswer++];
			}
		}

		this.buttons = [];
		this.questionOptions.forEach((option, index) => {
			this.buttons.push({
				label: option,
				id: index.toString(),
			});
		});

		this.updateMessage();
	}

	async updateMessage(content?: string) {
		const messageCompnents = [];
		if (this.question.type === 'boolean') {
			messageCompnents.push(this.makeButtonRow(...this.buttons));
		} else {
			this.buttons.forEach((button) => {
				messageCompnents.push(this.makeButtonRow(button));
			});
		}
		const messageOptions: MessageEditOptions = {
			embeds: [
				new MessageEmbed()
					.setColor(EMBEDCOLOR)
					.setTitle(this.question.question)
					.setFooter({text: `Category: ${this.question.category}, Difficulty: ${this.question.difficulty}`}),
			],
			components: messageCompnents,
		};
		if (content) messageOptions.content = content;
		this.message.edit(messageOptions);
	}

	async addToLeaderboard(user: User, incrementBy: number = 1) {
		const userDbDoc = this.client.firebase.getDoc('triviaLeaderboard', user.id);
		const currentLeaderboardValue = <LeaderboardItem> await this.client.firebase.getValue(userDbDoc);
		const avatar = user.avatarURL({
			dynamic: true,
		});
		if (!currentLeaderboardValue) {
			await this.client.firebase.setValue(userDbDoc, {
				name: user.username,
				score: incrementBy,
				avatar: avatar,
			});
			return;
		} else {
			const updateValue: LeaderboardItem = {score: currentLeaderboardValue.score + incrementBy};
			if (currentLeaderboardValue.avatar !== avatar) updateValue.avatar = avatar;
			await this.client.firebase.updateValue(userDbDoc, updateValue);
			return;
		}
	}

	public onButtonClick(buttonId: string): void {
		this.buttons = this.buttons.map((button) => {
			button.disabled = true;
			return button;
		});
		this.buttons[this.answer].style = 'SUCCESS';
		if (buttonId === this.answer.toString()) {
			this.updateMessage('Correct :smile:');
			this.addToLeaderboard(this.interaction.user);
		} else {
			this.buttons[buttonId].style = 'DANGER';
			this.updateMessage('Inncorrect :sob:');
		}
		this.finishCommand();
	}
}
