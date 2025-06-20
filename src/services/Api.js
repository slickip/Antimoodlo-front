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
}
,
  
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

  // Работа с вариантами ответов
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

  // Работа с правильными ответами
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
    console.log("Сохраняем квиз:", quizTitle);
    // 1) Создаём сам квиз
    // … внутри saveQuizToServer …
console.log("👉 Отправляем на сервер:", {
  title:        quizTitle,
  courseid:    1,
  duration:     duration,
  maxgrade:    100,
  startdate:   new Date().toISOString(),
  enddate:     end.toISOString(),
  stateid:     1,
});

  const quizRes = await api.post('/quizzes', {
  title:     quizTitle,
  courseid: 1,                      // уже было верно
  duration:  duration,                     // верно
  maxgrade:  100,                    // ← вместо max_grade
  stateid:   1,                      // ← вместо state_id
  startdate: new Date().toISOString(), // ← вместо start_date
  enddate:  end.toISOString() // ← оставляем underscore, сервер его принял
});


console.log('Создан квиз с ID:', quizRes.data.id);


    const quizId = quizRes.data.id;
    console.log('Создан квиз с ID:', quizId);

    // 2) Добавляем вопросы
    for (const q of questions) {
  const questionRes = await api.post(`/quizzes/${quizId}/questions`, {
    questiontext: q.question,
    questiontypeid: q.type === 'single' ? 1 : q.type === 'multiple' ? 2 : 3,
    quizid: quizId
  });
  const questionId = questionRes.data.id;
  console.log('Добавлен вопрос:', questionRes.data);

  // Matching question (обработка отдельно)
  if (q.type === 'matching') {
    // Сохраняем пары: left_items, right_items, correct_matches
    const { left_items, right_items, correct_matches } = q;

    for (const leftItem of left_items) {
      await api.post(`/questions/${questionId}/options`, {
        optiontext: leftItem,
        questionid: questionId,
        column: 'left'
      });
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



    continue; // ❗ переходим к следующему вопросу
  }

  // 🔽 Обычная обработка: single / multiple
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


    console.log("Квиз сохранён на сервере:", quizId);
    return quizRes;
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