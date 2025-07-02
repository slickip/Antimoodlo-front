import axios from 'axios';
//const axios = require('axios'); //чтоб тесты работали

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
 // Если quizData.questions нет — используем пустой массив
   const rawQs = Array.isArray(quizData.questions) ? quizData.questions : [];

   return {
     title:       quizData.quizTitle,
     description: quizData.quizDescription,
     questions:   rawQs.map(question => ({
       question: question.text,
       type:     question.type,
       options:  question.options,
       // …
     }))
   };
 };

export default {
  // Работа с тестами
  getQuizzes() {
    return api.get('/quizzes');
  },
  
  updateQuizMeta(id, data) {
    return api.put(`/quizzes/${id}`, data);
  },

  updateQuizOnServer(id, quizData) {
    // убрать transformQuizData или оставить для POST
    return this.updateQuizMeta(id, quizData);
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
  
  updateMatchPair(id, data) {
    return api.put(`/answers/match/${id}`, data);
  },
  deleteMatchPair(id) {
    return api.delete(`/answers/match/${id}`);
  },
  createMatchPair(data) {
    return api.post(`/questions/${data.questionid}/answers/match`, data);
  },

  updateOpenAnswer(id, data) {
    return api.put(`/answers/open/${id}`, data);
  },
  updateOption(optionId, optionData) {
    return api.put(`/answers/options/${optionId}`, optionData);
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
    const { quizTitle, questions, duration, userId, description } = quizData;
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
  courseid: 1,
  description: description,
  duration:  duration,               
  maxgrade:  100,                    
  stateid:   1,                      
  startdate: new Date().toISOString(), 
  enddate:  end.toISOString(),
  title:     quizTitle,
  userid : userId
}); 


//console.log('Создан квиз с ID:', quizRes.data.id);

  const questionTypeMap = { single: 1, multiple: 2, matching: 4, open: 3 };

    const quizId = quizRes.data.id;
    //console.log('Создан квиз с ID:', quizId);

    console.log("🚀 saveQuizToServer — questions array:", questions);

    for (const q of questions) {
      console.log(`🔹 Posting question id=${q.id}, text="${q.question}", points=`, q.points);
    // создаём вопрос
      const questionRes = await api.post(`/quizzes/${quizId}/questions`, {
        questiontext:   q.question,
        questiontypeid: questionTypeMap[q.type],
        quizid:         quizId,
        imageurl:       q.imageurl  || undefined,
        points:         q.points
      });
    const questionId = questionRes.data.id;

    // 3️⃣ Если matching — создаём left/right опции + пары
    if (q.type === 'matching') {
      for (const left of q.left_items) {
        await api.post(`/questions/${questionId}/options`, {
          optiontext: left,
          questionid: questionId,
          column:     'left'
        });
      }
      for (const right of q.right_items) {
        await api.post(`/questions/${questionId}/options`, {
          optiontext: right,
          questionid: questionId,
          column:     'right'
        });
      }
      for (const [L, R] of Object.entries(q.correct_matches)) {
        await api.post(`/questions/${questionId}/answers/match`, {
          lefttext:   L,
          righttext:  R,
          questionid: questionId
        });
      }
      continue;
    }

    // 4️⃣ Если open — создаём open-ответ
    if (q.type === 'open') {
      await api.post(`/questions/${questionId}/answers/open`, {
        answertext: q.correct_answer_text,
        questionid: questionId
      });
      continue;
    }

    // 5️⃣ Обычные опции для single/multiple
    const optionIds = [];
    for (const txt of q.options) {
      const optRes = await api.post(`/questions/${questionId}/options`, {
        optiontext: txt,
        questionid: questionId
      });
      optionIds.push(optRes.data.id);
    }

    // 6️⃣ Правильные ответы
    if (q.type === 'single' && q.correct_option_index != null) {
      await api.post(`/questions/${questionId}/answers/correct`, {
        optionid:   optionIds[q.correct_option_index],
        questionid: questionId
      });
    }
    if (q.type === 'multiple') {
      for (const idx of q.correct_option_indexes || []) {
        await api.post(`/questions/${questionId}/answers/correct`, {
          optionid:   optionIds[idx],
          questionid: questionId
        });
      }
    }
  }

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

    const correctMatches = matchPairs.reduce((acc, m) => {
      acc[m.lefttext] = m.righttext;
      return acc;
    }, {});
    
    const leftItems = Object.keys(correctMatches);
    const rightItems = Object.values(correctMatches); // уникальные правые

    // 5) Для open — текст ответа
    const correctAnswerText = openAnswers[0]?.answertext || "";

    // 6) Собираем готовый вопрос:
    const question = {
      id:       questionId,
      question: q.questiontext,
      type,
      points: q.points,
      imageurl: q.imageurl || "",
      ...(type !== "matching" && type !== "open" && { options: optionTexts }),
      ...(type === "single"   && { correct_option_index:   correctIndex }),
      ...(type === "multiple" && { correct_option_indexes: correctIndexes }),
      ...(type === "matching" && {
        correct_matches: correctMatches,
        left_items: leftItems,
        right_items: rightItems
      }),
      ...(type === "open"     && { correct_answer_text:    correctAnswerText })
    };
    questions.push(question);
  }

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    start:       quiz.startdate,
    end:         quiz.enddate,
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
  },

  getGrades() {
    return api.get('/grades');
  },

  addGrade(gradeData) {
    return api.post('/grades', gradeData);
  }

};
export { transformQuizData };
