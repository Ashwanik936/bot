import {MessageHandler} from '../../../core/ErrorHandling/MessageHandler';
import {FrodoClient, Interaction, Options} from '../../../core/FrodoClient';

export default function(this: FrodoClient, message: MessageHandler, options: Options, interaction: Interaction) {
	const content = [
		`Bot Ping: \`${message.message.createdTimestamp - interaction.createdTimestamp}ms\``,
		`API Ping: \`${Math.round(this.ws.ping)}ms\``,
		`WebSocket Ping: \`${this.webSocket.connected ? `${this.webSocket.ping}ms` : 'Disconnected'}\``,
	];
	message.edit(content.join('\n'));
}
