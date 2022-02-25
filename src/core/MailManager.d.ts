import {MailManagerSubjects} from './MailManagerType';

export interface SendMailOptions {
	from?: MailManagerSubjects;
	to: string;
	subject: string;
	text: string;
	textType?: 'text' | 'html';
}
