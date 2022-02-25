// Used in core files to get a message from an interaction

import {Message, CommandInteraction} from 'discord.js';
import {MessageHandler} from './ErrorHandling/MessageHandler.js';
import {handleError} from './ErrorHandling/ErrorHandler.js';

export async function getMessage(interaction: CommandInteraction, onError = () => {}): Promise<MessageHandler | undefined> {
	if (!interaction.deferred || !interaction.replied) {
		await interaction.deferReply()
			.catch((err) => {
				onError();
				handleError(err, interaction);
			});
	}
	const message = await interaction.fetchReply()
		.catch((err) => {
			onError();
			handleError(err, interaction);
		});
	return (message instanceof Message) ? new MessageHandler(message, interaction, onError) : undefined;
}
