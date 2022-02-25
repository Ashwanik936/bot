/* eslint-disable camelcase */
export interface ApiResponse {
	response_code: number;
	results: Question[];
}
export interface Question {
	category: string;
	difficulty: string;
	type: 'boolean' | 'multiple';
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
}
