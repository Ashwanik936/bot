import {Message, MessageEditOptions, MessagePayload} from 'discord.js';

export class DmMessageHandler {
	message: Message;

	constructor(message: Message) {
		this.message = message;
	}

	async edit(content: string | MessageEditOptions | MessagePayload): Promise<DmMessageHandler> {
		await this.message.edit(content)
			.catch(() => {});
		return this;
	}

	get content() {
		return this.message.content;
	}
}
