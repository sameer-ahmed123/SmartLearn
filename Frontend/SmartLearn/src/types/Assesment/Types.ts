export interface Question {
    question_text: string;
    options: string[];
    correct_index: number;
    explanation?: string;
}

