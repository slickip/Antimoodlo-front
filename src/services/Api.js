import axios from 'axios';

const API_BASE_URL = '/api';
const end   = new Date("2025-07-20T13:00:00+03:00");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Добавляем withCredentials если API требует куки/сессии
  // withCredentials: true
});

// Интерцептор для авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // Можно добавить обработку конкретных статус кодов
      if (error.response.status === 401) {
        // Например, перенаправление на страницу входа
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Функция для преобразования данных формы в формат API
const transformQuizData = (quizData) => {
  return {
    title: quizData.quizTitle,
    description: quizData.quizDescription,
    questions: quizData.questions.map(question => ({
      question: question.text,
      type: question.type,
      options: question.options,
      correct_option_index: question.type === 'single' ? question.correctOption : undefined,
      correct_option_indexes: question.type === 'multiple' ? question.correctOptions : undefined
    }))
  };
};

export default {
  // Работа с тестами
  getQuizzes() {
    return api.get('/quizzes');
  },
  
  getQuiz(id) {
    return api.get(`/quizzes/${id}`);
  },
  
  createQuiz(quizData) {
  const payload = {
    title: quizData.quizTitle,
    course_id: 1,
    duration: 30,
    max_grade: 100,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    state_id: 1,
    submited_date: new Date().toISOString()
  };
  return api.post('/quizzes', payload);
},
  
  getAllAnswers(questionId) {
    return api.get(`/questions/${questionId}/answers`);
  },

  updateQuiz(id, quizData) {
    const transformedData = transformQuizData(quizData);
    return api.put(`/quizzes/${id}`, transformedData);
  },
  
  deleteQuiz(id) {
    return api.delete(`/quizzes/${id}`);
  },

  // Работа с вопросами
  getQuestions(quizId) {
    return api.get(`/quizzes/${quizId}/questions`);
  },
  
  getQuestion(questionId) {
    return api.get(`/questions/${questionId}`);
  },
  
  createQuestion(quizId, questionData) {
    return api.post(`/quizzes/${quizId}/questions`, questionData);
  },
  
  updateQuestion(questionId, questionData) {
    return api.put(`/questions/${questionId}`, questionData);
  },
  
  deleteQuestion(questionId) {
    return api.delete(`/questions/${questionId}`);
  },

  getOptions(questionId) {
    return api.get(`/questions/${questionId}/options`);
  },
  
  createOption(questionId, optionData) {
    return api.post(`/questions/${questionId}/options`, optionData);
  },
  
  updateOption(optionId, optionData) {
    return api.put(`/qptions/${optionId}`, optionData);
  },
  
  deleteOption(optionId) {
    return api.delete(`/options/${optionId}`);
  },

  addOpenAnswer(questionId, answerData) {
    return api.post(`/questions/${questionId}/answers/open`, answerData);
  },

  getCorrectAnswers(questionId) {
    return api.get(`/questions/${questionId}/answers/correct`);
  },
  
  addCorrectAnswer(questionId, answerData) {
    return api.post(`/questions/${questionId}/answers/correct`, answerData);
  },
  
  deleteCorrectAnswer(answerId) {
    return api.delete(`/answers/correct/${answerId}`);
  },
  
  async saveQuizToServer(quizData) {
    const { quizTitle, questions, duration } = quizData;
//     console.log("Сохраняем квиз:", quizTitle);
// console.log("👉 Отправляем на сервер:", {
//   title:        quizTitle,
//   courseid:    1,
//   duration:     duration,
//   maxgrade:    100,
//   startdate:   new Date().toISOString(),
//   enddate:     end.toISOString(),
//   stateid:     1,
// });

  const quizRes = await api.post('/quizzes', {
  title:     quizTitle,
  courseid: 1,                      
  duration:  duration,               
  maxgrade:  100,                    
  stateid:   1,                      
  startdate: new Date().toISOString(), 
  enddate:  end.toISOString() 
});


//console.log('Создан квиз с ID:', quizRes.data.id);

  const questionTypeMap = {
    single:   1,
    multiple: 2,
    matching: 3,
    open:     3
  };

    const quizId = quizRes.data.id;
    //console.log('Создан квиз с ID:', quizId);

    
    for (const q of questions) {
      console.log("📤 Creating question:", {
  text: q.question,
  type: q.type,
  typeId: questionTypeMap[q.type]
});

  const questionRes = await api.post(`/quizzes/${quizId}/questions`, {
    questiontext: q.question,
    questiontypeid: questionTypeMap[q.type],
    quizid: quizId
  });
  const questionId = questionRes.data.id;
  console.log('Добавлен вопрос:', questionRes.data);

  if (q.type === 'matching') {
    const { left_items, right_items, correct_matches } = q;

    for (const leftItem of left_items) {
      await api.post(`/questions/${questionId}/options`, {
        optiontext: leftItem,
        questionid: questionId,
        column: 'left'
      });
    }

  if (q.type === 'open' && q.correct_answer_text) {
    await api.post(`/questions/${questionId}/answers/open`, {
      answertext: q.correct_answer_text,
      questionid: questionId
    });
    continue;
   } 

    for (const rightItem of right_items) {
      await api.post(`/questions/${questionId}/options`, {
        optiontext: rightItem,
        questionid: questionId,
        column: 'right'
      });
    }

   for (const [left, right] of Object.entries(correct_matches)) {
  await api.post(`/questions/${questionId}/answers/match`, {
    id: 0,
    lefttext: left,
    righttext: right,
    questionid: questionId
  });
}



    continue;
  }

  if (q.type !== 'open') {
  const optionIds = [];
  for (const optText of q.options) {
    const optRes = await api.post(`/questions/${questionId}/options`, {
      optiontext: optText,
      questionid: questionId
    });
    optionIds.push(optRes.data.id);
  }

  if (q.type === 'single' && q.correct_option_index != null) {
    await api.post(`/questions/${questionId}/answers/correct`, {
      optionid: optionIds[q.correct_option_index],
      questionid: questionId
    });
  }

  if (q.type === 'multiple' && Array.isArray(q.correct_option_indexes)) {
    for (const idx of q.correct_option_indexes) {
      await api.post(`/questions/${questionId}/answers/correct`, {
        optionid: optionIds[idx],
        questionid: questionId
      });
    }
  }
}
}


    //console.log("Квиз сохранён на сервере:", quizId);
    return quizRes;
  },

  async loadQuizPreview(quizId) {
  const quizRes = await api.get(`/quizzes/${quizId}`);
  const quiz = quizRes.data;

  const questionsRes = await api.get(`/quizzes/${quizId}/questions`);
  const questions = [];


  for (const q of questionsRes.data) {
    const questionId = q.id;

    const detailRes = await api.get(`/questions/${questionId}/answers`);
      const {
        options,
        correctAnswers,
        matchPairs,
        openAnswers
      } = detailRes.data;

    // matching: correct answers come as pairs
    const isMatching = q.questiontypeid === 3;
    const isOpen = q.questiontypeid === 4;

          // 1) Определяем тип вопроса:
          // теперь, сразу после распаковки, вставьте этот код:
    // 1) Определяем тип
    let type = "single";
    if      (matchPairs.length)         type = "matching";
    else if (openAnswers.length)        type = "open";
    else if (correctAnswers.length > 1) type = "multiple";

    // 2) Список текстов вариантов
    const optionTexts = options.map(o => o.optiontext);

    // 3) Вычисляем правильные индексы
    let correctIndex;
    let correctIndexes = [];
    if (type === "single") {
      const oid = correctAnswers[0]?.optionid;
      correctIndex = options.findIndex(o => o.id === oid);
    } else if (type === "multiple") {
      correctIndexes = correctAnswers
        .map(ca => ca.optionid)
        .map(oid => options.findIndex(o => o.id === oid))
        .filter(i => i !== -1)
        .sort();
    }

    // 4) Для matching — строим объект { left: right }
    const correctMatches = matchPairs.reduce((acc, m) => {
      acc[m.lefttext] = m.righttext;
      return acc;
    }, {});

    // 5) Для open — текст ответа
    const correctAnswerText = openAnswers[0]?.answertext || "";

    // 6) Собираем готовый вопрос:
    const question = {
      id:       questionId,
      question: q.questiontext,
      type,
      ...(type !== "matching" && type !== "open" && { options: optionTexts }),
      ...(type === "single"   && { correct_option_index:   correctIndex }),
      ...(type === "multiple" && { correct_option_indexes: correctIndexes }),
      ...(type === "matching" && { correct_matches: correctMatches }),
      ...(type === "open"     && { correct_answer_text:    correctAnswerText })
    };
    questions.push(question);
  }

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration,
    questions
  };
},

  getAllAnswers(questionId) {
  return api.get(`/questions/${questionId}/answers`);
},

  loadQuizFromServer(id) {
    return this.getQuiz(id);
  },
  
  updateQuizOnServer(id, quizData) {
    return this.updateQuiz(id, quizData);
  },
  
  deleteQuizFromServer(id) {
    return this.deleteQuiz(id);
  },

  getUsers() {
  return api.get('/users'); 
  }
};