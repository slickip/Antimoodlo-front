import axios from 'axios';

const API_BASE_URL = '/api';

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
    return api.get('/Quizzes');
  },
  
  getQuiz(id) {
    return api.get(`/Quizzes/${id}`);
  },
  
  createQuiz(quizData) {
    const transformedData = transformQuizData(quizData);
    return api.post('/Quizzes', transformedData);
  },
  
  updateQuiz(id, quizData) {
    const transformedData = transformQuizData(quizData);
    return api.put(`/Quizzes/${id}`, transformedData);
  },
  
  deleteQuiz(id) {
    return api.delete(`/Quizzes/${id}`);
  },

  // Работа с вопросами
  getQuestions(quizId) {
    return api.get(`/Quizzes/${quizId}/questions`);
  },
  
  getQuestion(questionId) {
    return api.get(`/Questions/${questionId}`);
  },
  
  createQuestion(quizId, questionData) {
    return api.post(`/Quizzes/${quizId}/questions`, questionData);
  },
  
  updateQuestion(questionId, questionData) {
    return api.put(`/Questions/${questionId}`, questionData);
  },
  
  deleteQuestion(questionId) {
    return api.delete(`/Questions/${questionId}`);
  },

  // Работа с вариантами ответов
  getOptions(questionId) {
    return api.get(`/Questions/${questionId}/options`);
  },
  
  createOption(questionId, optionData) {
    return api.post(`/Questions/${questionId}/options`, optionData);
  },
  
  updateOption(optionId, optionData) {
    return api.put(`/Options/${optionId}`, optionData);
  },
  
  deleteOption(optionId) {
    return api.delete(`/Options/${optionId}`);
  },

  // Работа с правильными ответами
  getCorrectAnswers(questionId) {
    return api.get(`/Questions/${questionId}/answers/correct`);
  },
  
  addCorrectAnswer(questionId, answerData) {
    return api.post(`/Questions/${questionId}/answers/correct`, answerData);
  },
  
  deleteCorrectAnswer(answerId) {
    return api.delete(`/Answers/correct/${answerId}`);
  },

  // Дополнительные методы для интеграции с ConfigUploadPage
  saveQuizToServer(quizData) {
    return this.createQuiz(quizData);
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
  
  // Метод для загрузки YAML файла
  uploadYamlFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/Quizzes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getUsers() {
  return api.get('/users');
  }
};