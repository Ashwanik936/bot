import {
	CommandInteraction,
	Guild,
	Message,
	MessageEditOptions,
	MessagePayload,
	ReactionManager,
	TextBasedChannel,
} from 'discord.js';

import {handleError} from './ErrorHandler.js';

export class MessageHandler {
	message: Message;
	interaction: CommandInteraction;
	started: boolean;
	onError: () => void;

	constructor(message: Message, interaction: CommandInteraction, onError: () => void) {
		this.message = message;
		this.interaction = interaction;
		this.started = false;
		this.onError = onError;
	}

	async edit(content: string | MessageEditOptions | MessagePayload): Promise<MessageHandler> {
		// Editing interactions error after 15 minutes because the token expires. We must edit the message directly
		// The first edit must be done with editReply to hide the loading bar from deferring the interaction
		if (this.started) {
			this.message.edit(content)
				.catch((e) => {
					this.onError();
					handleError(e, this.interaction);
				});
		} else {
			this.interaction.editReply(content)
				.catch((e) => {
					this.onError();
					handleError(e, this.interaction);
				});
		}

		this.started = true;
		return this;
	}

	get content(): string {
		return this.message.content;
	}

	get channel(): TextBasedChannel {
		return this.message.channel;
	}

	get reactions(): ReactionManager {
		return this.message.reactions;
	}

	get guild(): Guild {
		return this.message.guild;
	}

	get id(): string {
		return this.message.id;
	}
}
