// All class commands should extend this to get access to certain functions

import {
	ButtonInteraction,
	MessageActionRow,
	MessageButton,
	MessageEditOptions,
	MessagePayload,
	User,
} from 'discord.js';

import {RandomPlayers} from '../core/RandomPlayers.js';
import {RandomPlayersError} from '../core/RandomPlayersError.js';
import {ButtonValidate} from '../core/ButtonValidate.js';
import {CommandBaseOptions} from '../core/CommandBaseOptions';
import {Button} from '../core/Button';
import {Interaction, Message, Options, FrodoClient} from './FrodoClient.js';
import {getRandomPlayers} from './GetRandomPlayers.js';
import {handleError} from './ErrorHandling/ErrorHandler.js';
import {DmMessageHandler} from './ErrorHandling/DmMessageHandler.js';

export default class CommandBase {
	message: Message;
	options: Options;
	interaction: Interaction;
	client: FrodoClient;
	registerCommand: boolean;
	gameIsActive: boolean;
	lastButtonClick: number | null;

	constructor(options: CommandBaseOptions) {
		this.message = options.message;
		this.options = options.options;
		this.interaction = options.interaction;
		this.client = options.client;
		this.registerCommand = true;
		this.gameIsActive = true;
		this.lastButtonClick = null;
	}

	/**
	 * Generates a button row for a message and should be used to allow the button manager to work
	 * ```JS
	 * const buttonsRow = this.generateButtonRow(...buttons);
	 * this.message.edit({
	 * 	content: CONTENT,
	 * 	components: [buttonsRow],
	 * });
	 * ```
	 * @param {Button} buttons Buttons to be added to the message
	 * @return {MessageActionRow} A row of the buttons
	 */
	public makeButtonRow(...buttons: Button[]): MessageActionRow {
		const buttonArray = [];
		buttons.forEach((button) => {
			buttonArray.push(
				new MessageButton()
					.setLabel(button.label || '')
					.setCustomId(`${this.interaction.id}:${button.id}`)
					.setStyle(button.style || 'PRIMARY')
					.setDisabled(button.disabled || false)
					.setEmoji(button.emoji),
			);
		});
		const row = new MessageActionRow()
			.addComponents(...buttonArray);
		return row;
	}

	/**
	 * Finishes the command and removes the interaction from button manager
	 */
	public finishCommand(): void {
		this.gameIsActive = false;
		this.registerCommand = false;
		// Embeded in a try catch since some IDs can be undefined and cause fatal errors
		try {
			this.client.buttonManager.deleteCommand(
				this.message.guild.id,
				this.message.channel.id,
				this.interaction.id,
			);
		} catch (e) {}
	}

	/**
	 * Gets random players from the interaction options and will edit the message and finish the command if there is an error\
	 * This function should be run before other operations, ideally in the constructor
	 * ```JS
	 * const playersList = this.getRandomPlayers();
	 * if (!playersList) return;
	 * this.players = playersList.randomPlayers;
	 * this.playerOne = playersList.playerOne;
	 * this.playerTwo = playersList.playerTwo;
	 * ```
	 * @param {boolean} randomList If true, will get a random list of players
	 * @return {RandomPlayers | undefined} Random players or undefined if there is an error
	 */
	public getRandomPlayers(randomList: boolean = true): RandomPlayers | undefined {
		const playerList = getRandomPlayers(this.interaction, randomList);
		if (playerList instanceof Object) {
			return playerList;
		} else {
			switch (playerList) {
			case RandomPlayersError.PlayerNotFound:
				this.message.edit('One of the players could not be found');
				break;
			case RandomPlayersError.SamePlayer:
				this.message.edit('You cannot play against yourself');
				break;
			case RandomPlayersError.BotPlayer:
				this.message.edit('You cannot play against a bot');
				break;
			}
			this.finishCommand();
		}
	}

	/**
	 * Sends a DM to a specific user\
	 * If the user doesn't have DMs enabled, it will edit the message
	 * @param {User} user The user to send the message to
	 * @param {string | MessageEditOptions | MessagePayload} content The content of the message
	 * @return {Promise<DmMessageHandler>} A promise that resolves to a DmMessageHandler
	 */
	public async sendDm(user: User, content: string | MessageEditOptions | MessagePayload): Promise<DmMessageHandler> {
		try {
			const message = await user.send(content);
			return new DmMessageHandler(message);
		} catch (e) {
			this.finishCommand();
			if (e.code == 50007) {
				this.message.edit({
					content: `${user} is not currently accepting DMs\nPlease try changing your privacy settings and try again (https://support.discord.com/hc/en-us/articles/217916488)`,
					components: [],
					embeds: [],
				});
			} else {
				this.sendError(e);
			}
		}
	}

	public sendError(error): void {
		handleError(error, this.interaction);
	}

	/**
	 * @error This function should not be edited under any circumstances
	 * @param {string} buttonId The ID of the button that was clicked
	 * @param {User} user The user that clicked the button
	 */
	async innerButtonClick(buttonId: string, user: User) {
		this.lastButtonClick = Date.now();
		return this.onButtonClick(buttonId, user);
	}

	/**
	 * Runs when a button is clicked
	 * @param {string} buttonId The ID of the button that was clicked
	 * @param {User} user The user that clicked the button
	 */
	public onButtonClick(buttonId: string, user: User) {
		throw new Error('Method not implimented');
	}

	/**
	 * Validate a user's button click before main function is run
	 * @param {string} buttonId The ID of the button that was clicked
	 * @param {ButtonsInteraction} interaction The interaction that the button belongs to
	 * @return {ButtonValidate} Returns the action to be completed
	 */
	public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
		if (interaction.user.id === this.interaction.user.id) return ButtonValidate.Run;
		return ButtonValidate.Message;
	}

	/**
	 * Can be used in place of `validateButtonClick` in multiplayer games
	 * ```JS
	 * public validateButtonClick(buttonId: string, interaction: ButtonInteraction): ButtonValidate {
	 * 	return this.validateMultiplayerButtonClick(interaction, this.currentPlayer, this.players);
	 * }
	 * ```
	 * @param {ButtonInteraction} interaction The button interaction
	 * @param {User} currentPlayer The current player in the game
	 * @param {User[]} players The array of players in the game
	 * @return {ButtonValidate} Returns the action to be completed
	 */
	public validateMultiplayerButtonClick(interaction: ButtonInteraction, currentPlayer: User, players: User[]): ButtonValidate {
		if (interaction.user === currentPlayer) return ButtonValidate.Run;
		const playerIds = players.map((i) => i.id);
		if (playerIds.includes(interaction.user.id)) return ButtonValidate.Ignore;
		return ButtonValidate.Message;
	}
}
