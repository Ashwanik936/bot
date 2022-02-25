// Handles sending emails

import {createTransport, Transporter} from 'nodemailer';

import {FrodoClient} from './FrodoClient';
import {MailManagerSubjects, transporter} from './MailManagerType.js';
import {SendMailOptions} from './MailManager.d';
import Mail from 'nodemailer/lib/mailer';

export class MailManager {
	client: FrodoClient;
	transporter: Transporter;
	running: boolean;

	static SUBJECTS = {
		CAUGHT_ERROR: MailManagerSubjects.CAUGHT_ERROR,
		UNCAUGHT_ERROR: MailManagerSubjects.UNCAUGHT_ERROR,
	}

	constructor(client: FrodoClient) {
		this.client = client;
		this.running = true;
		if (!process.env.SENDMAIL) {
			this.client.warnLog('SENDMAIL var not preset, mail will not be sent');
			this.running = false;
			return;
		}
		this.setupMail();
		this.client.debugLog('MailManager has been initialized');
	}

	private setupMail() {
		try {
			this.transporter = createTransport(transporter(process.env.MAIL_USER, process.env.MAIL_PASS));
		} catch (e) {
			this.client.errorLog(`Error while setting up mail`, e);
			this.running = false;
		}
	}

	/**
	 * Send an email to the specified address
	 * @param {SendMailOptions} options The options of who to send to
	 */
	public async sendMail(options: SendMailOptions): Promise<void> {
		if (!this.running) return;
		const mailOptions: Mail.Options = {
			from: options.from,
			to: options.to,
			subject: options.subject,
			[options.textType ? options.textType : 'html']: options.text,
		};
		try {
			await this.transporter.sendMail(mailOptions);
		} catch (e) {
			this.client.errorLog(`Error while sending mail`, e);
		}
	}
}

export {MailManagerSubjects};
