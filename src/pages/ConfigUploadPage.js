import React, { useState, useEffect } from "react";
import yaml from "js-yaml";
import { FiLogOut, FiUpload, FiEye, FiX, FiCheck, FiPlus, FiTrash2, FiSave, FiCode } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/Api";
import Timer from "../components/Timer";
import "../styles/ConfigUploadPage.css";
import MatchingQuestion from "../components/MatchingQuestions";


function parseMoscow(iso) {
  // Преобразует строку в Date с учетом московского времени
  if (iso instanceof Date || typeof iso === "number") {
    return new Date(iso);
  }
  if (typeof iso !== "string") {
    iso = String(iso);
  }
  if (/[+\-]\d{2}:\d{2}$|Z$/.test(iso)) {
    return new Date(iso);
  }
  const [date, time] = iso.split("T");
  const [Y, M, D] = date.split("-").map(Number);
  const [h, m, s = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(Y, M - 1, D, h - 3, m, s));
}

function getNowMoscow() {
  const nowLocal = new Date();
  const offsetLocalMin = nowLocal.getTimezoneOffset();
  const offsetMoscowMin = 3 * 60;
  const deltaMs = (offsetMoscowMin + offsetLocalMin) * 60_000;
  return new Date(nowLocal.getTime() + deltaMs);
}

function Sidebar({ width, setWidth }) {
  const { logout } = useAuth();

  return (
    <div
      className="sidebar"
      style={{ width: `${width}px` }}
      onMouseEnter={() => setWidth(200)}
      onMouseLeave={() => setWidth(60)}
    >
      <div className="sidebar-section">
        <SidebarItem icon={<FiUpload />} label="Upload" />
        <SidebarItem icon={<FiEye />} label="Quizzes" />
      </div>
      <div className="sidebar-section">
        <SidebarItem icon={<FiLogOut />} label="Logout" onClick={logout} />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick }) {
  return (
    <div
      className="sidebar-item"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#010528";
        const labelSpan = e.currentTarget.querySelector("span");
        if (labelSpan) labelSpan.style.opacity = 1;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        const labelSpan = e.currentTarget.querySelector("span");
        if (labelSpan) labelSpan.style.opacity = 0;
      }}
      onClick={onClick}
    >
      <div className="sidebar-icon">{icon}</div>
      <span className="sidebar-label">{label}</span>
    </div>
  );
}

function QuizModal({ visible, onClose, quizConfig }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="close-modal"
        >
          <FiX />
        </button>
        <Quiz quizConfig={quizConfig} />
      </div>
    </div>
  );
}

function Quiz({ quizConfig }) {
  const [answers, setAnswers]     = useState({});
  const [result, setResult]       = useState(null);
  const [isTimeUp, setIsTimeUp]   = useState(false);

  const { start, end, title, description, questions, duration } = quizConfig.quiz;
  const startDate = parseMoscow(start);
  const endDate   = parseMoscow(end);

  const nowMoscow = getNowMoscow();
  const expired   = nowMoscow > endDate || isTimeUp;

  
  // Общая функция подсчёта результата
 const computeResult = () => {
  let correctCount = 0;

  questions.forEach(q => {
    const given = answers[q.id];

    if (q.type === "single") {
      if (given === q.correct_option_index) {
        correctCount++;
      }
    } else if (q.type === "matching") {
      const givenMatching = answers[q.id] || {};
      const correct = q.correct_matches;
      const allMatched = Object.keys(correct).every(k => givenMatching[k] === correct[k]);
      if (allMatched) {
        correctCount++;
      }
    } else {
      const a = (given || []).slice().sort().toString();
      const b = q.correct_option_indexes.slice().sort().toString();
      if (a === b) correctCount++;
    }
  });

  setResult(`✅ Правильных: ${correctCount} из ${questions.length}`);
};


  // автоматическая «обрезка» по реальному времени окончания
  useEffect(() => {
    if (result) return;
    const id = setInterval(() => {
      if (getNowMoscow() > endDate) {
        setIsTimeUp(true);
        computeResult();
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [endDate, questions, answers, result]);

  useEffect(() => {
    if (isTimeUp && !result) {
      computeResult();
    }
  }, [isTimeUp, result]);

  function getNowMoscow() {
  const nowLocal = new Date();
  const offsetLocalMin = nowLocal.getTimezoneOffset();     // в минутах (напр. –120 для CEST)
  const offsetMoscowMin = 3 * 60;                          // Москва = UTC+3
  // смещение до MSK = (offsetMoscow – (–offsetLocal)) 
  //                  = offsetMoscow + offsetLocal
  const deltaMs = (offsetMoscowMin + offsetLocalMin) * 60_000;
  return new Date(nowLocal.getTime() + deltaMs);
}

  if (nowMoscow < startDate) {
  return <>… Доступно с: { startDate.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }) } </>
  }
  

  // 3) хелпер для обработки кликов
  const handleChange = (questionId, optionIndex, isMultiple) => {
    if (isTimeUp || result) return;
    setAnswers(prev => {
      const current = prev[questionId] || (isMultiple ? [] : null);
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(optionIndex)
            ? current.filter(x => x !== optionIndex)
            : [...current, optionIndex],
        };
      }
      return { ...prev, [questionId]: optionIndex };
    });
  };

return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>

      {/* таймер только если ещё нет результата */}
      {!result && <Timer duration={duration} onTimeUp={() => setIsTimeUp(true)} />}

      {expired && result ? (
        // 5a) время вышло и результат уже вычислен
        <p style={{ fontWeight: "bold", marginTop: 12 }}>{result}</p>
      ) : (
        // 5b) показываем вопросы + кнопку
        <>
          {questions.map(q => {
  if (q.type === "matching") {
    return (
      <div key={q.id} style={{ marginBottom: 24 }}>
        <strong>{q.id}. {q.question}</strong>
        <MatchingQuestion
          question={q}
          answer={answers}
          setAnswer={setAnswers}
          disabled={expired}
        />
      </div>
    );
  }

  const isMultiple = q.type === "multiple";
  return (
    <div key={q.id} style={{ marginBottom: 16 }}>
      <strong>{q.id}. {q.question}</strong>
      {q.options.map((opt, i) => {
        const checked = isMultiple
          ? (answers[q.id] || []).includes(i)
          : answers[q.id] === i;
        return (
          <label
            key={i}
            style={{ display: "flex", alignItems: "center", marginTop: 4 }}
          >
            <input
              type={isMultiple ? "checkbox" : "radio"}
              checked={checked}
              disabled={expired}
              onChange={() => handleChange(q.id, i, isMultiple)}
              style={{ marginRight: 8 }}
            />
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
})}


          <button
            onClick={() => setIsTimeUp(true)}
            disabled={expired}
            style={{ marginTop: 12 }}
          >
            Проверить ответы
          </button>
        </>
      )}
    </div>
  );
}

function CustomCheckbox({ checked, isRadio }) {
  return (
    <span
      className={`custom-checkbox ${isRadio ? 'custom-radio' : ''} ${checked ? 'checked' : ''}`}
    >
      {checked && (
        isRadio ? (
          <span className="radio-dot" />
        ) : (
          <FiCheck className="check-icon" />
        )
      )}
    </span>
  );
}

function ConfigUploadPage() {
  const [quizStart, setQuizStart] = useState("");
  const [quizEnd, setQuizEnd] = useState("");
  const [quizDurationInput, setQuizDurationInput] = useState(60);
  const [quizConfig, setQuizConfig] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(60);
  const [activeTab, setActiveTab] = useState('upload');
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [yamlText, setYamlText] = useState("");
  const [yamlError, setYamlError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    text: "",
    type: "single",
    options: ["", ""],
    correctOption: null,
    correctOptions: [],
    left_items: [""],
    right_items: [""],
    correct_matches: {}
  });

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await api.getQuizzes();
        setSavedQuizzes(response.data);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        const saved = localStorage.getItem('savedQuizzes');
        if (saved) {
          setSavedQuizzes(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setYamlText(text);
        
        try {
    const text = await file.text();
    const parsed = yaml.load(text);
  } catch (err) {
    console.error("❌ Ошибка при разборе YAML:", err);
    alert("Не удалось прочитать YAML-файл");
  } 
      };
      reader.readAsText(file);
    } catch (err) {
      setError("Ошибка загрузки файла: " + err.message);
      setQuizConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  const exportYaml = () => {
  let filename = "quiz_config";

  try {
    const parsed = yaml.load(yamlText);
    if (parsed && parsed.quiz && parsed.quiz.title) {
      filename = parsed.quiz.title
        .replace(/\s+/g, "_")         // пробелы → _
        .replace(/[^\w\-]/g, "");     // убрать всё кроме букв, цифр, _
    }
  } catch (e) {
    console.warn("Could not parse YAML for filename:", e.message);
  }

  const blob = new Blob([yamlText], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.yaml`;  // ← динамическое имя
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


  const openPreviewFromYaml = () => {
    try {
      const parsed = yaml.load(yamlText);
      setQuizConfig(parsed);
      setShowModal(true);
      setYamlError(null);
    } catch (e) {
      setYamlError(`YAML parsing error: ${e.message}`);
    }
  };

  const openInGuiCreator = () => {
    try {
      const parsed = yaml.load(yamlText);
      if (!parsed || !parsed.quiz) {
        throw new Error("Invalid YAML structure: missing 'quiz' root");
      }
      
      setQuizTitle(parsed.quiz.title || "");
      setQuizDescription(parsed.quiz.description || "");
      setQuestions(parsed.quiz.questions || []);
      
      if (parsed.quiz.duration) {
        setQuizDurationInput(parsed.quiz.duration);
      }
      
      if (parsed.quiz.start) {
        const date = new Date(parsed.quiz.start);
        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setQuizStart(offsetDate.toISOString().slice(0, 16));
      }

      if (parsed.quiz.end) {
        const date = new Date(parsed.quiz.end);
        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setQuizEnd(offsetDate.toISOString().slice(0, 16));
      }

      setActiveTab('create');
      setYamlError(null);
    } catch (e) {
      setYamlError(`YAML parsing error: ${e.message}`);
    }
  };
const isDisabled = () => {
  const textEmpty = !currentQuestion.text.trim();

  if (currentQuestion.type === "single") {
    return textEmpty || currentQuestion.correctOption === null || currentQuestion.options.every(opt => !opt.trim());
  }

  if (currentQuestion.type === "multiple") {
    return textEmpty || currentQuestion.correctOptions.length === 0 || currentQuestion.options.every(opt => !opt.trim());
  }

  if (currentQuestion.type === "matching") {
    const leftFilled = currentQuestion.left_items?.filter(item => item.trim()).length;
    const rightFilled = currentQuestion.right_items?.filter(item => item.trim()).length;
    const matches = currentQuestion.correct_matches || {};
    const allMatched = leftFilled > 0 && rightFilled > 0 && leftFilled === Object.keys(matches).length;
    return textEmpty || !allMatched;
  }

  return true;
};

  const saveQuiz = async () => {
    const quizData = {
      quizTitle,
      quizDescription,
      questions,
      duration: quizDurationInput,
      start: quizStart,
      end: quizEnd
    };

     if (quizStart && quizEnd && new Date(quizStart) >= new Date(quizEnd)) {
      alert("Дата окончания должна быть позже даты начала");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.saveQuizToServer(quizData);
      const newQuiz = {
        id: response.data.id || Date.now(),
        title: quizTitle,
        description: quizDescription,
        questions: questions,
        createdAt: new Date().toISOString()
      };

      const updatedQuizzes = [...savedQuizzes, newQuiz];
      setSavedQuizzes(updatedQuizzes);
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
      alert('Квиз успешно сохранен!');
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert('Ошибка при сохранении квиза');
    } finally {
      setIsLoading(false);
    }
  };

 const loadSavedQuiz = async (quiz) => {
  try {
    setIsLoading(true);
    const response = await api.loadQuizFromServer(quiz.id);
    const serverQuiz = response.data;

    // Устанавливаем поля из базы
    setQuizTitle(serverQuiz.title || "");
    setQuizDescription(serverQuiz.description || "");
    setQuizStart(serverQuiz.startdate || "");
    setQuizEnd(serverQuiz.enddate || "");

    // 🚩 Правильно: получаем вопросы с сервера
    const questionsResponse = await api.getQuestions(quiz.id);
    const serverQuestions = questionsResponse.data;

    setQuestions(serverQuestions || []);
    setActiveTab('create');
  } catch (error) {
    console.warn("Failed to load from server, using local data:", error);
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description);
    setQuestions(quiz.questions);
    setActiveTab('create');
  } finally {
    setIsLoading(false);
  }
};


  const deleteSavedQuiz = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите удалить этот квиз?')) return;

    try {
      setIsLoading(true);
      await api.deleteQuizFromServer(id);
      const updatedQuizzes = savedQuizzes.filter(q => q.id !== id);
      setSavedQuizzes(updatedQuizzes);
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert('Ошибка при удалении квиза');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
  const base = {
    id: questions.length + 1,
    question: currentQuestion.text,
    type: currentQuestion.type
  };

  let newQuestion;

  if (currentQuestion.type === "matching") {
    newQuestion = {
      ...base,
      left_items: currentQuestion.left_items.filter(item => item.trim() !== ""),
      right_items: currentQuestion.right_items.filter(item => item.trim() !== ""),
      correct_matches: currentQuestion.correct_matches
    };
  } else if (currentQuestion.type === "single") {
    newQuestion = {
      ...base,
      options: currentQuestion.options.filter(opt => opt.trim() !== ""),
      correct_option_index: currentQuestion.correctOption
    };
  } else {
    newQuestion = {
      ...base,
      options: currentQuestion.options.filter(opt => opt.trim() !== ""),
      correct_option_indexes: currentQuestion.correctOptions
    };
  }

  setQuestions([...questions, newQuestion]);

  setCurrentQuestion({
    id: questions.length + 2,
    text: "",
    type: "single",
    options: ["", ""],
    correctOption: null,
    correctOptions: [],
    left_items: [""],
    right_items: [""],
    correct_matches: {}
  });
};


  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({...currentQuestion, options: newOptions});
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""]
    });
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctOption: currentQuestion.correctOption === index ? null : 
                   currentQuestion.correctOption > index ? currentQuestion.correctOption - 1 : 
                   currentQuestion.correctOption,
      correctOptions: currentQuestion.correctOptions
        .map(opt => opt > index ? opt - 1 : opt)
        .filter(opt => opt !== index)
    });
  };

  const handleCorrectAnswerChange = (index, isChecked) => {
    if (currentQuestion.type === "single") {
      setCurrentQuestion({...currentQuestion, correctOption: index});
    } else {
      const newCorrect = isChecked 
        ? [...currentQuestion.correctOptions, index]
        : currentQuestion.correctOptions.filter(i => i !== index);
      setCurrentQuestion({...currentQuestion, correctOptions: newCorrect});
    }
  };

  const generateYAML = () => {
    const quiz = {
      quiz: {
        title: quizTitle,
        description: quizDescription,
        duration: quizDurationInput,
        start: quizStart,
        end: quizEnd,
        questions: questions
      }
    };
    
    const yamlStr = yaml.dump(quiz);
    const blob = new Blob([yamlStr], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_${Date.now()}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewQuiz = () => {
    setQuizConfig({
      quiz: {
        title: quizTitle,
        description: quizDescription,
        start: quizStart,
        end: quizEnd,
        duration: quizDurationInput,
        questions: questions
      }
    });
    if (quizStart && quizEnd && new Date(quizStart) >= new Date(quizEnd)) {
      alert("Дата окончания должна быть позже даты начала");
      return;
    }
    setShowModal(true);
  };

  const renderGUICreator = () => (
    <div className="editor-container">
      <h2 className="editor-title">Create new quiz</h2>
      
      <div className="editor-field">
        <label className="editor-label">Quiz Title:</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="editor-input"
          placeholder="Enter quiz title"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Description:</label>
        <textarea
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
          className="editor-textarea"
          placeholder="Enter quiz description"
        />
      </div>

      <div className="editor-field duration-field">
        <label className="editor-label">Duration (сек):</label>
        <input
          type="number"
          min="1"
          value={quizDurationInput}
          onChange={e => setQuizDurationInput(Number(e.target.value))}
          className="duration-input"
        />
      </div>

      <div className="editor-field"> {/*открытие квиза поле ввода*/}Add commentMore actions
        <label className="editor-label">Start Date & Time (МСК):</label>
        <input
          type="datetime-local"
          value={quizStart}
          onChange={(e) => setQuizStart(e.target.value)}
          className="editor-input"
        />
      </div>

      <div className="editor-field"> {/*закрытие квиза поле ввода*/}
        <label className="editor-label">End Date & Time (МСК):</label>
        <input
          type="datetime-local"
          value={quizEnd}
          onChange={(e) => setQuizEnd(e.target.value)}
          className="editor-input"
        />
      </div>
      <div className="question-container">
        <h3 className="section-title">Add Question</h3>
        
        <div className="editor-field">
          <label className="editor-label">Question Text:</label>
          <input
            type="text"
            value={currentQuestion.text}
            onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
            className="editor-input"
            placeholder="Enter your question"
          />
        </div>

        <div className="editor-field">
          <label className="editor-label">Question Type:</label>
          <select
            value={currentQuestion.type}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion, 
              type: e.target.value,
              correctOption: null,
              correctOptions: []
            })}
            className="editor-select"
          >
            <option value="single">Single correct answer</option>
            <option value="multiple">Multiple correct answers</option>
            <option value="matching">Matching correct answer</option>
          </select>
        </div>
        {currentQuestion.type === "matching" && ( //Я ХЗ ТУТ ЛИ ЭТО ДОЛЖНО НАХОДИТСЯ
  <div>
    {/* Left column */}
    <div className="editor-field">
      <label className="editor-label">Left Column:</label>
      {currentQuestion.left_items.map((item, index) => (
        <input
          key={index}
          type="text"
          value={item}
          onChange={e => {
            const newLeft = [...currentQuestion.left_items];
            newLeft[index] = e.target.value;
            setCurrentQuestion({...currentQuestion, left_items: newLeft});
          }}
          placeholder={`Left ${index + 1}`}
          className="option-input"
        />
      ))}
      <button onClick={() =>
        setCurrentQuestion({...currentQuestion, left_items: [...currentQuestion.left_items, ""]})
      } className="add-option-btn">
        <FiPlus size={16} /> Add Left
      </button>
    </div>

    {/* Right column */}
    <div className="editor-field">
      <label className="editor-label">Right Column:</label>
      {currentQuestion.right_items.map((item, index) => (
        <input
          key={index}
          type="text"
          value={item}
          onChange={e => {
            const newRight = [...currentQuestion.right_items];
            newRight[index] = e.target.value;
            setCurrentQuestion({...currentQuestion, right_items: newRight});
          }}
          placeholder={`Right ${index + 1}`}
          className="option-input"
        />
      ))}
      <button onClick={() =>
        setCurrentQuestion({...currentQuestion, right_items: [...currentQuestion.right_items, ""]})
      } className="add-option-btn">
        <FiPlus size={16} /> Add Right
      </button>
    </div>

    {/* Correct matches */}
    <div className="editor-field">
      <label className="editor-label">Correct Matches:</label>
      {currentQuestion.left_items.map((left, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <span style={{ width: 80 }}>{left || `Left ${i + 1}`}</span>
          <select
            value={currentQuestion.correct_matches[left] || ""}
            onChange={e => {
              setCurrentQuestion({
                ...currentQuestion,
                correct_matches: {
                  ...currentQuestion.correct_matches,
                  [left]: e.target.value
                }
              });
            }}
            className="editor-select"
          >
            <option value="">Select match</option>
            {currentQuestion.right_items.map((right, j) => (
              <option key={j} value={right}>{right}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  </div>
)}

{(currentQuestion.type === "single" || currentQuestion.type === "multiple") && (
  <div className="editor-field">
    <label className="editor-label">Options:</label>
    {currentQuestion.options.map((option, index) => (
      <div key={index} className="option-row">
        <input
          type={currentQuestion.type === "single" ? "radio" : "checkbox"}
          name={`correct-answer-${currentQuestion.id}`}
          checked={
            currentQuestion.type === "single"
              ? currentQuestion.correctOption === index
              : currentQuestion.correctOptions.includes(index)
          }
          onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
          className="correct-answer-input"
        />
        <input
          type="text"
          value={option}
          onChange={(e) => updateOption(index, e.target.value)}
          className="option-input"
          placeholder={`Option ${index + 1}`}
        />
        <button 
          onClick={() => removeOption(index)}
          className="remove-option-btn"
        >
          <FiTrash2 />
        </button>
      </div>
    ))}
    <button
      onClick={addOption}
      className="add-option-btn"
    >
      <FiPlus size={16} /> Add Option
    </button>
  </div>
)}


        <button
          onClick={addQuestion}
          disabled={isDisabled()}
          className="add-question-btn"
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <div>
          <h3 className="section-title">Added Questions ({questions.length})</h3>
          <div className="questions-list">
            {questions.map((q, i) => (
              <div key={i} className="question-item">
                <div>
                  <div className="question-summary">{q.id}. {q.question}</div>
                  <div className="question-type">
                    Type: {q.type === "single"
                            ? "Single answer"
                            : q.type === "matching"
                              ? "Matching answers"
                              : "Multiple answers"}

                  </div>
                </div>
                <button 
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                  className="remove-question-btn"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="actions-container">
            <button
              onClick={previewQuiz}
              className="action-btn preview-btn"
            >
              <FiEye /> Preview Quiz
            </button>
            <button
              onClick={generateYAML}
              disabled={!quizTitle || questions.length === 0}
              className="action-btn export-btn"
            >
              <FiUpload /> Export as YAML
            </button>
            <button
              onClick={saveQuiz}
              disabled={!quizTitle || questions.length === 0 || isLoading}
              className="action-btn save-btn"
            >
              {isLoading ? "Saving..." : <><FiSave /> Save Quiz</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 1) Функция для загрузки полного превью из БД
const handlePreviewSavedQuiz = async (quizMeta) => {
  setIsLoading(true);
  try {
    // a) метаданные квиза
    const { data: quizData } = await api.getQuiz(quizMeta.id);

    // b) вопросы
    const { data: questionsList } = await api.getQuestions(quizMeta.id);

    // c) для каждого вопроса — все ответы
    const questions = await Promise.all(
      questionsList.map(async q => {
        const { data: ans } = await api.getAllAnswers(q.id);
        const type = q.questiontypeid === 1
          ? 'single'
          : q.questiontypeid === 2
            ? 'multiple'
            : 'matching';

        if (type === 'single') {
          // варианты + индекс правильного
          const options = ans.options.map(o => o.optiontext);
          const correct = ans.correctAnswers[0]?.optionid;
          return {
            id: q.id,
            question: q.questiontext,
            type,
            options,
            correct_option_index: correct != null
              ? options.findIndex((_, i) => ans.correctAnswers[0].optionid === ans.options?.[i]?.id)
              : undefined
          };
        }

        if (type === 'multiple') {
          const options = ans.options.map(o => o.optiontext);
          const correctIndexes = ans.correctAnswers.map(ca =>
            options.findIndex((_, i) => ca.optionid === ans.options[i].id)
          );
          return {
            id: q.id,
            question: q.questiontext,
            type,
            options,
            correct_option_indexes: correctIndexes
          };
        }

        // matching
        const left_items  = ans.options.filter(o => !ans.matchPairs.find(mp => mp.righttext === o.optiontext)).map(o => o.optiontext);
        const right_items = ans.options.filter(o => !left_items.includes(o.optiontext)).map(o => o.optiontext);
        const correct_matches = Object.fromEntries(
          ans.matchPairs.map(mp => [mp.lefttext, mp.righttext])
        );
        return {
          id: q.id,
          question: q.questiontext,
          type,
          left_items,
          right_items,
          correct_matches
        };
      })
    );

    // d) Собираем объект для модалки и открываем
    setQuizConfig({
      quiz: {
        title:       quizData.title,
        description: quizData.description,
        start:       quizData.startdate,
        end:         quizData.enddate,
        duration:    quizData.duration,
        questions
      }
    });
    setShowModal(true);

  } catch (err) {
    console.error("Ошибка при загрузке превью квиза:", err);
    alert("Не удалось загрузить превью теста из базы");
  } finally {
    setIsLoading(false);
  }
};

  const renderSavedQuizzes = () => (
  <div className="saved-quizzes-container">
    <h2 className="section-title">Saved Quizzes</h2>

    {isLoading ? (
      <p className="loading-text">Loading quizzes...</p>
    ) : savedQuizzes.length === 0 ? (
      <p className="no-quizzes-text">No saved quizzes yet</p>
    ) : (
      <div className="quizzes-list">
        {savedQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => loadSavedQuiz(quiz)}
            className="quiz-item"
          >
            <div className="quiz-header">
              <div>
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-description">{quiz.description}</p>
                <p className="quiz-date">
                  {new Date(quiz.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                 onClick={e => {
                e.stopPropagation();
                handlePreviewSavedQuiz(quiz);
                }}
                className="preview-quiz-btn"
                >
                <FiEye />
                </button>

                <button
                  onClick={(e) => deleteSavedQuiz(quiz.id, e)}
                  className="delete-quiz-btn"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


  const renderUploadTab = () => (
    <div className="upload-container">
      <h2 className="section-title">Upload Quiz Config</h2>
      <label
        htmlFor="config-upload"
        className="upload-label"
      >
        <FiUpload style={{ marginRight: "8px" }} /> Select YAML File
        <input
          type="file"
          id="config-upload"
          style={{ display: "none" }}
          accept=".yaml,.yml"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>

      {isLoading && <p className="loading-text">Uploading file...</p>}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="yaml-editor-container">
        <h3 className="editor-titleg">YAML Editor</h3>
        <textarea
          value={yamlText}
          onChange={(e) => setYamlText(e.target.value)}
          className="yaml-textarea" //штука чтоб высвечивалась в конструкторе yaml файла
          placeholder="QUIZ EXAMPLE:
quiz:
  title: Example quiz (Please write the title in English)
  questions:
    - id: 1
      question: How are you
      type: single
      options:
        - Fine
        - Bad
      correct_option_index: 0
    - id: 2
      question: Why?
      type: multiple
      options:
        - Because of beautiful day
        - Everything is bad in my life
        - Woke up with this mood
      correct_option_indexes:
        - 0
        - 2
"
          rows={20}
        />
        
        {yamlError && (
          <div className="error-message">
            {yamlError}
          </div>
        )}
        
        <div className="editor-buttons">
          <button
            onClick={exportYaml}
            className="action-btn"
            disabled={!yamlText.trim()}
          >
            <FiUpload /> Export YAML
          </button>
          <button
            onClick={openPreviewFromYaml}
            className="action-btn"
            disabled={!yamlText.trim()}
          >
            <FiEye /> Open Preview
          </button>
          <button
            onClick={openInGuiCreator}
            className="action-btn"
            disabled={!yamlText.trim()}
          >
            <FiCode /> Open in GUI-Creator
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="quiz-creator-container">
      <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />
      
      <div className="main-content" style={{ marginLeft: sidebarWidth }}>
        <div className="header-container">
          <h1 className="page-title">Quiz Creator</h1>
        </div>

        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('upload')}
          >
            <FiUpload /> Upload Config
          </button>
          
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('create')}
          >
            <FiPlus /> Create New
          </button>
          
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('saved')}
          >
            <FiSave /> Saved Quizzes
          </button>
        </div>

        {activeTab === 'upload' ? renderUploadTab() : 
         activeTab === 'create' ? renderGUICreator() : 
         renderSavedQuizzes()}

        <QuizModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          quizConfig={quizConfig}
        />
      </div>
    </div>
  );
}

export default ConfigUploadPage;