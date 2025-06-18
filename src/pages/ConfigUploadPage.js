import React, { useState, useEffect } from "react";
import yaml from "js-yaml";
import { FiLogOut, FiUpload, FiEye, FiX, FiCheck, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/Api";
import Timer from "../components/Timer";

// Компонент для подсветки YAML
const YamlExample = () => {
  return (
    <div style={{ 
      backgroundColor: "#282c34",
      padding: "20px",
      borderRadius: "8px",
      overflowX: "auto",
      fontSize: "14px",
      lineHeight: "1.5",
      fontFamily: "'Fira Code', monospace, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ color: "#abb2bf" }}>
        <div style={{ color: "#e06c75" }}>quiz:</div>
        <div style={{ marginLeft: "20px", color: "#e06c75" }}>title: <span style={{ color: "#98c379" }}>"Пример квиза"</span></div>
        <div style={{ marginLeft: "20px", color: "#e06c75" }}>description: <span style={{ color: "#98c379" }}>"Тест на общие знания"</span></div>
        <div style={{ marginLeft: "20px", color: "#e06c75" }}>questions:</div>
        
        <div style={{ marginLeft: "40px", color: "#e06c75" }}>- id: <span style={{ color: "#d19a66" }}>1</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>question: <span style={{ color: "#98c379" }}>"Какой язык программирования используется для фронтенда?"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>type: <span style={{ color: "#98c379" }}>"single"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>options:</div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"Python"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"JavaScript"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"C++"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"Ruby"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>correct_option_index: <span style={{ color: "#d19a66" }}>1</span></div>
        
        <div style={{ marginLeft: "40px", color: "#e06c75" }}>- id: <span style={{ color: "#d19a66" }}>2</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>question: <span style={{ color: "#98c379" }}>"Выберите все правильные ответы!"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>type: <span style={{ color: "#98c379" }}>"multiple"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>options:</div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"HTML"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"CSS"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"SQL"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"JavaScript"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>correct_option_indexes: <span style={{ color: "#d19a66" }}>[0, 1, 3]</span></div>
        
        <div style={{ marginLeft: "40px", color: "#e06c75" }}>- id: <span style={{ color: "#d19a66" }}>3</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>question: <span style={{ color: "#98c379" }}>"Что означает CSS?"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>type: <span style={{ color: "#98c379" }}>"single"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>options:</div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"Cascading Style Sheets"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"Computer Style Sheets"</span></div>
        <div style={{ marginLeft: "80px", color: "#98c379" }}>- <span style={{ color: "#98c379" }}>"Creative Style System"</span></div>
        <div style={{ marginLeft: "60px", color: "#e06c75" }}>correct_option_index: <span style={{ color: "#d19a66" }}>0</span></div>
      </div>
    </div>
  );
};

function Sidebar({ width, setWidth }) {
  const { logout } = useAuth();

  const sidebarStyle = {
    height: "100vh",
    width: `${width}px`,
    backgroundColor: "rgba(1, 5, 40, 0.8)",
    color: "#fff",
    transition: "width 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 10,
    boxShadow: "4px 0 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  };

  const sectionStyle = {
    padding: "20px 10px",
  };

  return (
    <div
      style={sidebarStyle}
      onMouseEnter={() => setWidth(200)}
      onMouseLeave={() => setWidth(60)}
    >
      <div style={sectionStyle}>
        <SidebarItem icon={<FiUpload />} label="Upload" />
        <SidebarItem icon={<FiEye />} label="Quizzes" />
      </div>
      <div style={sectionStyle}>
        <SidebarItem icon={<FiLogOut />} label="Logout" onClick={logout} />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick }) {
  const itemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background 0.2s ease",
    color: "#fff",
  };

  const iconStyle = {
    fontSize: "20px",
    marginRight: "12px",
    minWidth: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  };

  const labelStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.background = "#010528";
    const labelSpan = e.currentTarget.querySelector("span");
    if (labelSpan) labelSpan.style.opacity = 1;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = "transparent";
    const labelSpan = e.currentTarget.querySelector("span");
    if (labelSpan) labelSpan.style.opacity = 0;
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div style={iconStyle}>{icon}</div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

function QuizModal({ visible, onClose, quizConfig }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            fontWeight: "bold",
            fontSize: "24px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#010528",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiX />
        </button>
        <Quiz quizConfig={quizConfig} />
      </div>
    </div>
  );
}

function Quiz({ quizConfig }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const handleChange = (questionId, optionIndex, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionId] || (isMultiple ? [] : null);

      if (isMultiple) {
        if (current.includes(optionIndex)) {
          return { ...prev, [questionId]: current.filter((i) => i !== optionIndex) };
        } else {
          return { ...prev, [questionId]: [...current, optionIndex] };
        }
      } else {
        return { ...prev, [questionId]: optionIndex };
      }
    });
  };

  const checkAnswers = () => {
    const questions = quizConfig.quiz.questions;
    let correct = 0;

    questions.forEach((q) => {
      const a = answers[q.id];
      if (q.type === "single" && a === q.correct_option_index) correct++;
      if (
        q.type === "multiple" &&
        Array.isArray(a) &&
        a.length === q.correct_option_indexes.length &&
        a.every((val) => q.correct_option_indexes.includes(val))
      ) {
        correct++;
      }
    });

    setResult(`Правильных ответов: ${correct} из ${questions.length}`);
  };

  useEffect(() => {
    // Как только isTimeUp становится true — вызываем проверку
    if (isTimeUp) {
      checkAnswers();
    }
  }, [isTimeUp]);

  return (
    <div>
      <h2 style={{ color: "#010528" }}>{quizConfig.quiz.title}</h2>
      <p>{quizConfig.quiz.description}</p>
      {/* Таймер */}
      {quizConfig.quiz.duration && !result && (
        <Timer
          duration={quizConfig.quiz.duration}
          onTimeUp={() => {
            setIsTimeUp(true);
            setResult("⏰ Время вышло! Квиз завершён.");
          }}
        />
      )}

      {quizConfig.quiz.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <strong style={{ color: "#010528" }}>{q.id}. {q.question}</strong>
          {q.options.map((opt, i) => {
            const isMultiple = q.type === "multiple";
            const checked = isMultiple
              ? (answers[q.id] || []).includes(i)
              : answers[q.id] === i;

            return (
              <label
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 10,
                  cursor: "pointer",
                  userSelect: "none",
                  marginTop: 6,
                }}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  name={`q-${q.id}`}
                  checked={checked}
                  onChange={() => handleChange(q.id, i, isMultiple)}
                  style={{ display: "none" }}
                  disabled={isTimeUp}
                />
                <CustomCheckbox checked={checked} isRadio={!isMultiple} />
                <span style={{ marginLeft: 8, color: "#010528" }}>{opt}</span>
              </label>
            );
          })}
        </div>
      ))}
      {!isTimeUp && !result && (
  <button
    onClick={checkAnswers}
    style={{
      padding: "10px 20px",
      marginTop: 10,
      backgroundColor: "#010528",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0921E6"}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#010528"}
  >
    Проверить ответы
  </button>
  )}
      {result && (
        <p style={{ fontWeight: "bold", marginTop: 10, color: "#010528" }}>
          {result}
        </p>
      )}
    </div>
  );
}

function CustomCheckbox({ checked, isRadio }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: isRadio ? "50%" : "4px",
        border: "2px solid #010528",
        backgroundColor: checked ? "#010528" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {checked && (
        isRadio ? (
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#fff",
              display: "block",
            }}
          />
        ) : (
          <FiCheck color="#fff" size={16} />
        )
      )}
    </span>
  );
}

function ConfigUploadPage() {
  const [quizDurationInput, setQuizDurationInput] = useState(60); // 60 секунд по-умолчанию
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
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    text: "",
    type: "single",
    options: ["", ""],
    correctOption: null,
    correctOptions: []
  });

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await api.getQuizzes();
        setSavedQuizzes(response.data);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        // Fallback to local storage if API fails
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
      // Попробуем сначала загрузить через API
      const response = await api.uploadYamlFile(file);
      setQuizConfig(response.data);
      setError(null);
      setShowModal(true);
    } catch (apiError) {
      console.warn("API upload failed, trying local parsing:", apiError);
      // Если API не работает, парсим локально
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = yaml.load(e.target.result);
            setQuizConfig(parsed);
            setError(null);
            setShowModal(true);
          } catch (parseError) {
            setError("Ошибка парсинга YAML: " + parseError.message);
            setQuizConfig(null);
          }
        };
        reader.readAsText(file);
      } catch (err) {
        setError("Ошибка загрузки файла: " + err.message);
        setQuizConfig(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuiz = async () => {
    const quizData = {
      quizTitle,
      quizDescription,
      questions
    };

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
      
      // Сохраняем и в локальное хранилище на случай проблем с API
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
      // Пытаемся загрузить с сервера
      const response = await api.loadQuizFromServer(quiz.id);
      const serverQuiz = response.data;
      
      setQuizTitle(serverQuiz.title);
      setQuizDescription(serverQuiz.description);
      setQuestions(serverQuiz.questions);
      setActiveTab('create');
    } catch (error) {
      console.warn("Failed to load from server, using local data:", error);
      // Если не получилось с сервера, используем локальные данные
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
      // Пытаемся удалить с сервера
      await api.deleteQuizFromServer(id);
      
      // Удаляем локально в любом случае
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
    const newQuestion = {
      id: questions.length + 1,
      question: currentQuestion.text,
      type: currentQuestion.type,
      options: currentQuestion.options.filter(opt => opt.trim() !== ""),
      ...(currentQuestion.type === "single" 
        ? { correct_option_index: currentQuestion.correctOption } 
        : { correct_option_indexes: currentQuestion.correctOptions })
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      id: questions.length + 2,
      text: "",
      type: "single",
      options: ["", ""],
      correctOption: null,
      correctOptions: []
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
        duration: quizDurationInput,
        questions: questions
      }
    });
    setShowModal(true);
  };

  const renderGUICreator = () => (
    <div style={{ 
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#010528", marginBottom: "20px" }}>Create new quiz</h2>
      
      <div style={{ marginBottom: "25px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Quiz Title:</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px"
          }}
          placeholder="Enter quiz title"
        />
      </div>

      <div style={{ marginBottom: "25px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Description:</label>
        <textarea
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            minHeight: "80px",
            fontSize: "16px"
          }}
          placeholder="Enter quiz description"
        />
      </div>

 {/* --- Duration --- */}
     <div style={{ marginBottom: "25px", display: "flex", alignItems: "center" }}>
       <label style={{ width: "120px", fontWeight: 500 }}>Duration (сек):</label>
       <input
         type="number"
         min="1"
         value={quizDurationInput}
         onChange={e => setQuizDurationInput(Number(e.target.value))}
         style={{
           width: "100px",
           padding: "8px",
           borderRadius: "6px",
           border: "1px solid #ddd",
           fontSize: "16px"
         }}
       />

+     </div>
      <div style={{ 
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "25px"
      }}>
        <h3 style={{ color: "#010528", marginTop: 0, marginBottom: "15px" }}>Add Question</h3>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Question Text:</label>
          <input
            type="text"
            value={currentQuestion.text}
            onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              fontSize: "16px"
            }}
            placeholder="Enter your question"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Question Type:</label>
          <select
            value={currentQuestion.type}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion, 
              type: e.target.value,
              correctOption: null,
              correctOptions: []
            })}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              width: "100%",
              fontSize: "16px"
            }}
          >
            <option value="single">Single correct answer</option>
            <option value="multiple">Multiple correct answers</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Options:</label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "10px",
              gap: "10px"
            }}>
              <input
                type={currentQuestion.type === "single" ? "radio" : "checkbox"}
                name={`correct-answer-${currentQuestion.id}`}
                checked={
                  currentQuestion.type === "single" 
                    ? currentQuestion.correctOption === index 
                    : currentQuestion.correctOptions.includes(index)
                }
                onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                style={{ transform: "scale(1.2)" }}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px"
                }}
                placeholder={`Option ${index + 1}`}
              />
              <button 
                onClick={() => removeOption(index)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ff4444",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            style={{
              padding: "8px 15px",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              marginTop: "10px"
            }}
          >
            <FiPlus size={16} /> Add Option
          </button>
        </div>

        <button
          onClick={addQuestion}
          disabled={!currentQuestion.text || 
                   currentQuestion.options.every(opt => !opt.trim()) ||
                   (currentQuestion.type === "single" && currentQuestion.correctOption === null) ||
                   (currentQuestion.type === "multiple" && currentQuestion.correctOptions.length === 0)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#010528",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            opacity: (!currentQuestion.text || 
                     currentQuestion.options.every(opt => !opt.trim()) ||
                     (currentQuestion.type === "single" && currentQuestion.correctOption === null) ||
                     (currentQuestion.type === "multiple" && currentQuestion.correctOptions.length === 0)) 
                     ? 0.5 : 1,
            transition: "opacity 0.3s, background-color 0.3s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0921E6"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#010528"}
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <div>
          <h3 style={{ color: "#010528", marginBottom: "15px" }}>Added Questions ({questions.length})</h3>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "15px", 
            borderRadius: "8px",
            marginBottom: "25px"
          }}>
            {questions.map((q, i) => (
              <div key={i} style={{ 
                padding: "12px", 
                borderBottom: i < questions.length - 1 ? "1px solid #ddd" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: "500", marginBottom: "5px" }}>{q.id}. {q.question}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Type: {q.type === "single" ? "Single answer" : "Multiple answers"}
                  </div>
                </div>
                <button 
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ff4444",
                    fontSize: "18px"
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: 'wrap' }}>
            <button
              onClick={previewQuiz}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0921E6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#010528"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0921E6"}
            >
              <FiEye /> Preview Quiz
            </button>
            <button
              onClick={generateYAML}
              disabled={!quizTitle || questions.length === 0}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: (!quizTitle || questions.length === 0) ? 0.5 : 1,
                transition: "opacity 0.3s, background-color 0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#218838"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#28a745"}
            >
              <FiUpload /> Export as YAML
            </button>
            <button
              onClick={saveQuiz}
              disabled={!quizTitle || questions.length === 0 || isLoading}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6f42c1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: (!quizTitle || questions.length === 0 || isLoading) ? 0.5 : 1,
                transition: "opacity 0.3s, background-color 0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#5a3d9f"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#6f42c1"}
            >
              {isLoading ? "Saving..." : <><FiSave /> Save Quiz</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSavedQuizzes = () => (
    <div style={{ 
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#010528", marginBottom: "20px" }}>Saved Quizzes</h2>
      
      {isLoading ? (
        <p style={{ color: "#666", textAlign: "center" }}>Loading quizzes...</p>
      ) : savedQuizzes.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center" }}>No saved quizzes yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {savedQuizzes.map((quiz) => (
            <div 
              key={quiz.id}
              onClick={() => loadSavedQuiz(quiz)}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s",
                ':hover': {
                  backgroundColor: "#f8f9fa"
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#010528" }}>{quiz.title}</h3>
                  <p style={{ margin: "5px 0 0", color: "#666" }}>{quiz.description}</p>
                  <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#999" }}>
                    {new Date(quiz.createdAt).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => deleteSavedQuiz(quiz.id, e)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ff4444",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUploadTab = () => (
    <div style={{ 
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#010528", marginBottom: "20px" }}>Upload Quiz Config</h2>
      <label
        htmlFor="config-upload"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#010528",
          color: "#fff",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "500",
          fontSize: "16px",
          transition: "background-color 0.3s",
          marginBottom: "20px"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0921E6"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#010528"}
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

      {isLoading && <p style={{ color: "#666" }}>Uploading file...</p>}

      {error && (
        <div style={{ 
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3 style={{ color: "#010528", marginBottom: "15px" }}>Example YAML Structure</h3>
        <YamlExample />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}>
      <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />
      <div
        style={{
          padding: "40px",
          flexGrow: 1,
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s ease",
          backgroundColor: "#f5f5f5",
          overflowY: "auto",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{ color: "#010528", margin: 0 }}>Quiz Creator</h1>
        </div>

        <div style={{ 
          display: "flex", 
          gap: "20px",
          marginBottom: "30px"
        }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: "12px 24px",
              backgroundColor: activeTab === 'upload' ? "#010528" : "#e9ecef",
              color: activeTab === 'upload' ? "#fff" : "#010528",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FiUpload /> Upload Config
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: "12px 24px",
              backgroundColor: activeTab === 'create' ? "#010528" : "#e9ecef",
              color: activeTab === 'create' ? "#fff" : "#010528",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FiPlus /> Create New
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            style={{
              padding: "12px 24px",
              backgroundColor: activeTab === 'saved' ? "#010528" : "#e9ecef",
              color: activeTab === 'saved' ? "#fff" : "#010528",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
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