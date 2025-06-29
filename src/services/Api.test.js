import { transformQuizData } from './Api';

//we are testing the transformQuizData function exported from Api.js.
describe('transformQuizData', () => {
  //test case 1
  it('returns an empty array of questions if there are no input', () => {
    const input = { quizTitle: 'My Quiz', quizDescription: 'Desc' }; //test input
    const res = transformQuizData(input);

    expect(res).toEqual({ //expected output
      title: 'My Quiz',
      description: 'Desc',
      questions: [],
    });
  });

  //confirm that when input questions are provided, each question is transformed into the backend format with question, type, and options fields.
  //test case 2
  it('maps the text/type/options fields to the desired format', () => {
    const quizData = { //test input
      quizTitle: 'Test',
      quizDescription: 'D',
      questions: [
        { text: 'Q1', type: 'single', options: ['A', 'B'] },
        { text: 'Q2', type: 'open', options: [] },
      ],
    };

    const res = transformQuizData(quizData);

    expect(res).toEqual({ //expected output
      title: 'Test',
      description: 'D',
      questions: [
        { question: 'Q1', type: 'single', options: ['A', 'B'] },
        { question: 'Q2', type: 'open', options: [] },
      ],
    });
  });
});
