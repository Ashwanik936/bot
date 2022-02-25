// Checks the slash commands that are stored on Discord and compares to local ones

import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';

import {ContextMenuCommand} from '../core/ContextMenuCommand';
import {contextMenuCommands} from '../contextMenu.js';
import {CommandOption, CommandRegisterData} from '../core/CommandRegister.d';
import {Command} from '../core/Command';
import {commandToJson} from './CommandToJson.js';
import {FrodoClient} from './FrodoClient.js';

export default class CommandRegister {
	client: FrodoClient;

	localCommands: CommandRegisterData[];
	discordCommands: CommandRegisterData[];
	localContextCommands: ContextMenuCommand[];
	discordContextCommands: ContextMenuCommand[];

	commandsNeedToUpdate: boolean;
	typeMap: Object;
	processFinished: boolean;
	onComplete: () => void;
	rest: REST;
	applicationRoute: `/${string}`;
	guildRoute: `/${string}`;

	constructor(localCommands: Command[], client: FrodoClient) {
		this.client = client;
		this.discordCommands = [];
		this.commandsNeedToUpdate = false;
		this.processFinished = false;
		this.typeMap = {
			USER: 2,
			MESSAGE: 3,
		};
		this.onComplete = () => {};

		this.rest = new REST({version: '9'}).setToken(process.env.TOKEN);
		this.applicationRoute = Routes.applicationCommands(this.client.user.id);
		this.guildRoute = Routes.applicationGuildCommands(this.client.user.id, process.env.GUILDID || '839919274395303946');

		this.start(localCommands);
	}

	private async checkForCommandReset() {
		if (process.argv.includes('--reset-commands')) {
			this.client.debugLog('--reset-commands flag detected, resetting commands');
			return await this.resetCommands();
		}
	}

	async resetCommands() {
		await Promise.all([
			this.rest.put(this.guildRoute, {body: []}),
			this.rest.put(this.applicationRoute, {body: []}),
		]);
		return;
	}

	private async start(localCommands) {
		await this.checkForCommandReset();

		this.localCommands = this.commandsToArray(localCommands);
		this.localContextCommands = await this.getLocalContextCommands();
		const [discordCommands, discordContextCommands] = await this.getCurrentDiscordCommands();
		this.discordCommands = this.commandsToArray(discordCommands);
		this.discordContextCommands = this.contextCommandsToArray(discordContextCommands);
		this.compareCommands();
	}

	private commandsToArray(commands): CommandRegisterData[] {
		const newCommands: CommandRegisterData[] = [];
		Object.keys(commands).forEach((commandId) => {
			const command = commands[commandId];
			const newIndex = newCommands.push({
				name: command.name,
				description: command.description,
			});

			if (command.options?.length > 0) {
				newCommands[newIndex - 1].options = command.options;
			}
		});

		newCommands.sort((a, b) => a.name.localeCompare(b.name));
		newCommands.forEach((command, index) => {
			if (command.options) {
				newCommands[index].options = command.options.map((value) => {
					const command: CommandOption = {
						name: value.name,
						description: value.description,
						type: value.type,
						required: value.required,
					};
					if (value.choices) command.choices = value.choices;
					return command;
				});
			}
		});

		return newCommands;
	}

	private async getCurrentDiscordCommands() {
		const discordCommands = [];
		const discordContextCommands = [];
		const discordCommandsResponse = await (process.env.RUNTIME ?
			this.client.application.commands.fetch() :
			this.client.guilds.cache.get('839919274395303946').commands.fetch()
		);

		discordCommandsResponse.forEach((command) => {
			if (command.type === 'USER' || command.type === 'MESSAGE') {
				command.type = this.typeMap[command.type];
				discordContextCommands.push(command);
			} else {
				discordCommands.push(command);
			}
		});

		return [discordCommands, discordContextCommands];
	}

	private compareCommands() {
		if (process.argv.includes('--update-commands')) {
			this.client.debugLog('--update-commands flag detected, updating commands');
			return this.registerCommands();
		}

		this.client.debugLog('Comparing Local and Discord commands');
		const commandsEqual = JSON.stringify(this.localCommands) === JSON.stringify(this.discordCommands);
		const contextCommandsEqual = JSON.stringify(this.localContextCommands) === JSON.stringify(this.discordContextCommands);
		if (!commandsEqual || !contextCommandsEqual) {
			this.client.debugLog('Local and Discord commands are different, re-uploading commands');
			this.registerCommands();
		} else {
			this.client.debugLog('Commands don\'t need to be updated');
			this.processFinished = true;
			this.onComplete();
		}
	}

	private async registerCommands() {
		const commandList = [];

		for (const command of this.localCommands) {
			commandList.push(commandToJson(command));
		}
		for (const command of this.localContextCommands) {
			commandList.push(command);
		}

		const route = process.env.RUNTIME ? this.applicationRoute : this.guildRoute;
		await this.rest.put(route, {body: commandList});

		this.client.debugLog('Commands successfully registered');
		this.processFinished = true;
		this.onComplete();
	}

	private contextCommandsToArray(commands) {
		const newCommands: ContextMenuCommand[] = [];
		Object.keys(commands).forEach((commandId) => {
			const command = commands[commandId];
			newCommands.push({
				name: command.name,
				type: command.type,
			});
		});

		newCommands.sort((a, b) => a.name.localeCompare(b.name));
		return newCommands;
	}

	private async getLocalContextCommands() {
		contextMenuCommands.sort((a, b) => a.name.localeCompare(b.name));
		const newCommands = contextMenuCommands.map((value) => {
			value.type = this.typeMap[value.type];
			return value;
		});

		return newCommands;
	}

	public setCompleteEvent(event: () => void) {
		this.onComplete = event;
	}
}
