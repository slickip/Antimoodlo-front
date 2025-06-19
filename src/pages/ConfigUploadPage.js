import React, { useState, useEffect } from "react";
import yaml from "js-yaml";
import { FiLogOut, FiUpload, FiEye, FiX, FiCheck, FiPlus, FiTrash2, FiSave, FiCode } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/Api";
import Timer from "../components/Timer";
import "../styles/ConfigUploadPage.css";

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
    if (isTimeUp) {
      checkAnswers();
    }
  }, [isTimeUp]);

  return (
    <div>
      <h2 className="quiz-title">{quizConfig.quiz.title}</h2>
      <p>{quizConfig.quiz.description}</p>
      
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
        <div key={q.id} className="question-block">
          <strong className="question-text">{q.id}. {q.question}</strong>
          {q.options.map((opt, i) => {
            const isMultiple = q.type === "multiple";
            const checked = isMultiple
              ? (answers[q.id] || []).includes(i)
              : answers[q.id] === i;

            return (
              <label
                key={i}
                className="option-label"
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
                <span className="option-text">{opt}</span>
              </label>
            );
          })}
        </div>
      ))}
      {!isTimeUp && !result && (
        <button
          onClick={checkAnswers}
          className="check-answers-btn"
        >
          Проверить ответы
        </button>
      )}
      {result && (
        <p className="quiz-result">
          {result}
        </p>
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
          const response = await api.uploadYamlFile(file);
          setQuizConfig(response.data);
          setError(null);
          setShowModal(true);
        } catch (apiError) {
          console.warn("API upload failed, trying local parsing:", apiError);
          try {
            const parsed = yaml.load(text);
            setQuizConfig(parsed);
            setError(null);
            setShowModal(true);
          } catch (parseError) {
            setError("Ошибка парсинга YAML: " + parseError.message);
            setQuizConfig(null);
          }
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
    const blob = new Blob([yamlText], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_config_${Date.now()}.yaml`;
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
      
      setActiveTab('create');
      setYamlError(null);
    } catch (e) {
      setYamlError(`YAML parsing error: ${e.message}`);
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
      setQuizTitle(serverQuiz.title || "");
      setQuizDescription(serverQuiz.description || "");
      setQuestions(serverQuiz.questions || []);
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
          </select>
        </div>

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

        <button
          onClick={addQuestion}
          disabled={!currentQuestion.text || 
                   currentQuestion.options.every(opt => !opt.trim()) ||
                   (currentQuestion.type === "single" && currentQuestion.correctOption === null) ||
                   (currentQuestion.type === "multiple" && currentQuestion.correctOptions.length === 0)}
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
                    Type: {q.type === "single" ? "Single answer" : "Multiple answers"}
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
                <button 
                  onClick={(e) => deleteSavedQuiz(quiz.id, e)}
                  className="delete-quiz-btn"
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
          className="yaml-textarea"
          placeholder="Enter your YAML configuration here..."
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