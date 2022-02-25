// Handles the base connection to Discord

import chalk from 'chalk';
import {Client, Collection, CommandInteraction, CommandInteractionOptionResolver, ButtonInteraction, MessageEmbed} from 'discord.js';
import {AutoPoster as autoPoster} from 'topgg-autoposter';
import {BasePoster} from 'topgg-autoposter/dist/structs/BasePoster';

import {MessageHandler} from './ErrorHandling/MessageHandler.js';
import CommandRegister from './CommandRegister.js';
import ButtonManager from './ButtonManager.js';
import CommandBase from './CommandBase.js';
import Firebase from './Firebase.js';
import {MailManager} from './MailManager.js';
import {makeEmail, makeGitLabIssue, makeUncaughtErrorEmail} from './MailManagerType.js';
import StatusManager from './StatusManager.js';
import WebSocketManager from './WebSocketManager.js';
import {EMBEDCOLOR} from './GlobalConstants.js';

import * as commands from '../commands/commands.js';
import * as events from '../events/events.js';

export class FrodoClient extends Client {
	commands: Collection<string, any>;
	startTime: number;
	commandRegister: CommandRegister;
	buttonManager: ButtonManager;
	firebase: Firebase;
	mailer: MailManager;
	statusManager: StatusManager;
	topggPoster: BasePoster;
	webSocket: WebSocketManager;

	constructor(args?) {
		super(args);
		this.commands = new Collection();
		this.startTime = Date.now();
		this.loadCommands();
		this.registerEvents();
		this.startFirebase();
		this.startMailer();
	}

	private async loadCommands() {
		this.debugLog('Registering commands');
		for (const command of Object.values(commands)) {
			this.debugLog(` -> Loading command ${command.name}`);
			const handler = command.handler.prototype instanceof CommandBase ? command.handler : command.handler.bind(this);
			const commandData = {data: command, run: handler};
			this.commands.set(command.name, commandData);
		}
	}

	private createCommandRegister() : FrodoClient {
		this.debugLog('Making Command Register');
		const commandArray = [];
		this.commands.forEach((command) => {
			commandArray.push(command.data);
		});

		this.commandRegister = new CommandRegister(commandArray, this);
		return this;
	}

	private startFirebase() {
		this.debugLog('Starting firebase');
		this.firebase = new Firebase(this);
	}

	private startMailer() {
		this.debugLog('Starting MailManager');
		this.mailer = new MailManager(this);
		this.listenForErrors();
	}

	private listenForErrors() {
		process.on('uncaughtException', async (error) => {
			this.errorLog('Uncaught Error', error);
			await this.mailer.sendMail({
				from: MailManager.SUBJECTS.UNCAUGHT_ERROR,
				to: process.env.EMAILRECIVERS,
				subject: `Frodo Bot Uncaught Error (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()})`,
				text: makeUncaughtErrorEmail([
					['title', `Frodo has encountered the following error:`],
					['date', `${new Date()}`],
					['error', error.stack.split('\n').join('<br/>')],
				]),
			});
			if (process.env.GITLABISSUEEMAIL) {
				await this.mailer.sendMail({
					from: MailManager.SUBJECTS.UNCAUGHT_ERROR,
					to: process.env.GITLABISSUEEMAIL,
					subject: `[NEEDS REVIEWING] ${error.name} Error in Runtime`,
					text: makeGitLabIssue(error),
					textType: 'html',
				});
			}
			process.exit(1);
		});
	}

	public async sendErrorMail(error, interaction: CommandInteraction) {
		this.mailer.sendMail({
			from: MailManager.SUBJECTS.CAUGHT_ERROR,
			to: process.env.EMAILRECIVERS,
			subject: `Frodo Bot Caught Error (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()})`,
			text: makeEmail([
				['title', 'Frodo has caught the following error:'],
				['date', `${new Date()}`],
				['command_name', interaction.commandName],
				['command_id', interaction.id],
				['error', error.stack.split('\n').join('<br/>')],
			]),
		});
	}

	public async connectToDiscord() {
		this.debugLog('Attempting to login to discord...');
		await this.login(process.env.TOKEN);
		this.debugLog('Logged into Discord');
		await this.createCommandRegister();
		this.debugLog('Making WebSocket Manager');
		this.webSocket = new WebSocketManager(process.env.RUNTIME && !process.env.TESTING, this, process.env.WEBSOCKETAUTH);
		this.debugLog('Creating button manager');
		this.buttonManager = new ButtonManager(this);
		this.debugLog('Making Status Manager');
		this.statusManager = new StatusManager(this, 600000);
		this.startTopggPoster();
		this.finishDiscordLogin();
	}

	private async registerEvents() : Promise<FrodoClient> {
		this.debugLog('Registering events');
		for (const event of Object.values(events)) {
			this.debugLog(` -> Registering event ${event.name} (${event.identifier})`);
			this.on(event.name, event.handler.bind(this));
		}

		this.debugLog('Events registered');
		return this;
	}

	public async sendVoteMessage(id: string) {
		const user = await this.users.fetch(id);
		if (!user) return;
		user.send({
			embeds: [
				new MessageEmbed()
					.setColor(EMBEDCOLOR)
					.setTitle('Thanks for voting for Frodo!')
					.setDescription('Voting for Frodo helps us out greatly and if you would like to further support us, be sure to vote for us everyday!')
					.addFields([
						{name: 'Want to add Frodo to your own server?', value: 'https://invite.frodo.fun', inline: true},
						{name: 'Want to vote again?', value: 'https://top.gg/bot/734746193082581084/vote', inline: true},
					]),
			],
		}).catch(() => {});
	}

	private finishDiscordLogin() {
		this.debugLog('Finished logging into Discord');
		if (this.commandRegister.processFinished) {
			this.completeFinishLogin();
			return;
		}
		this.commandRegister.setCompleteEvent(this.completeFinishLogin.bind(this));
	}

	private startTopggPoster() {
		if (process.env.RUNTIME && !process.env.TESTING && process.env.TOPGG_TOKEN) {
			this.debugLog('Starting top.gg poster');
			this.topggPoster = autoPoster(process.env.TOPGG_TOKEN, this);
			this.topggPoster.on('posted', () => {
				this.debugLog('Stats posted to top.gg');
			});
		} else {
			this.warnLog('Not starting top.gg poster');
		}
	}

	private completeFinishLogin() {
		this.debugLog(`Started in ${this.timeSinceStart / 1000} second${this.timeSinceStart == 1000 ? '' : 's'}`);
	}

	public get timeSinceStart(): number {
		return Date.now() - this.startTime;
	}

	public get serverCount(): number {
		return this.guilds.cache.size;
	}

	get time() {
		const date = new Date();
		return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	}

	public debugLog(message: string) {
		console.log(`[${chalk.blue('DEBUG')}][${chalk.yellow(this.time)}] ${message}`);
	}

	public warnLog(message: string) {
		console.log(`[${chalk.rgb(189, 183, 107)('WARN')}][${chalk.yellow(this.time)}] ${message}`);
	}

	public errorLog(message: string, error?: Error) {
		console.log(`[${chalk.red('ERROR')}][${chalk.yellow(this.time)}] ${message}${error ? `\n${error.stack}` : ''}`);
	}
}

export {MessageHandler as Message, CommandInteractionOptionResolver as Options, CommandInteraction as Interaction, ButtonInteraction};
