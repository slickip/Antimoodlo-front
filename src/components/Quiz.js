import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/Api";
import Timer from "./Timer";
import MatchingQuestion from "./MatchingQuestions";
import { useAuth } from "../context/AuthContext";

function Quiz({ quizConfig }) {
  const { quizId: urlQuizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizData, setQuizData] = useState(quizConfig || null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [loading, setLoading] = useState(!quizConfig);

  const questionRefs = useRef([]); //массив референсев на вопросы для навигации

  if (questionRefs.current.length !== (quizData?.quiz?.questions || quizData?.questions || []).length) {
    questionRefs.current = Array((quizData?.quiz?.questions || quizData?.questions || []).length)
      .fill()
      .map((_, i) => questionRefs.current[i] || React.createRef());
  }
  useEffect(() => {
    if (quizConfig) return; // Никаких запросов если передан quizConfig

    const loadQuiz = async () => {
      if (!urlQuizId) {
        setQuizData(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.loadQuizPreview(urlQuizId);
        setQuizData(data);
      } catch (err) {
        console.error("Ошибка загрузки квиза:", err);
        setQuizData(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [urlQuizId, quizConfig]);

  if (loading) return <p>Загрузка квиза...</p>;
  if (!quizData) return <p>Ошибка: квиз не найден.</p>;

  const { title, description, questions, duration, start, end } =
    quizData.quiz || quizData;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  const expired = now > endDate || isTimeUp;

  const computeResult = async () => {
  let totalPoints = 0;
  let earnedPoints = 0;

  questions.forEach(q => {
    const pts = q.points || 1;
    const given = answers[q.id];
    let isCorrect = false;

    if (q.type === "single") {
      isCorrect = given === q.correct_option_index;
    } else if (q.type === "matching") {
      const givenMatching = answers[q.id] || {};
      const correct = q.correct_matches;
      isCorrect = Object.keys(correct).every(k => givenMatching[k] === correct[k]);
    } else if (q.type === "multiple") {
      const a = Array.isArray(given) ? given.slice().sort().toString() : "";
      const b = Array.isArray(q.correct_option_indexes) ? q.correct_option_indexes.slice().sort().toString() : "";
      isCorrect = a === b;
    } else if (q.type === "open") {
      const givenText = (given || "").trim().toLowerCase();
      const correctText = (q.correct_answer_text || "").trim().toLowerCase();
      isCorrect = givenText === correctText;
    }

    totalPoints += pts;
    if (isCorrect) earnedPoints += pts;
  });

  setResult(`✅ Score: ${earnedPoints} / ${totalPoints} points`);

  const quizIdToSend = urlQuizId || quizData?.id || quizData?.quiz?.id;

  console.log("🟢 Попытка отправить оценку:", {
    id: 0,
    points: earnedPoints,
    quizid: quizIdToSend,
    userid: user?.userid
  });

  // Отправляем оценку только если:
  // - пользователь существует
  // - его роль = 1
  // - есть корректный quizId
  if (user && user.userrole === 1 && quizIdToSend) {
    try {
      await api.addGrade({
        id: 0,
        points: earnedPoints,
        quizid: Number(quizIdToSend),
        userid: user.userid
      });
      console.log("✅ Оценка успешно сохранена");
    } catch (err) {
      console.error("Ошибка при сохранении оценки:", err);
    }
  } else {
    console.warn("⏭️ Оценка не отправлена: либо роль не 1, либо quizId отсутствует");
  }
};



  const handleChange = (questionId, optionIndex, isMultiple) => {
    if (isTimeUp || result) return;
    setAnswers(prev => {
      const current = prev[questionId] || (isMultiple ? [] : null);
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(optionIndex)
            ? current.filter(x => x !== optionIndex)
            : [...current, optionIndex]
        };
      }
      return { ...prev, [questionId]: optionIndex };
    });
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {/* Панель номеров вопросов */}
      <div
        style={{
          display: "flex",
          justifyContent: "left",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgb(30, 34, 77)',
            borderRadius: '12px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '0px 16px 16px 16px'
          }}
        >
          {questions.map((_, i) => (
            <button
            key={i}
            onClick={() =>
              questionRefs.current[i]?.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              })
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: "white",
              color: "#1e224d",
              fontWeight: "bold",
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
              verticalAlign: "middle"
            }}
          >
            <span style={{ display: "block", lineHeight: 1 }}>{i + 1}</span>
          </button>
          ))}
        </div>
      </div>
      {!result && !isTimeUp && (
        <Timer duration={duration} onTimeUp={() => setIsTimeUp(true)} />
      )}

      {result && (
        <p style={{ fontWeight: "bold", marginTop: 12 }}>{result}</p>
      )}

      {questions.map((q, i) => {
      if (q.type === "matching") {
        return (
          <div key={q.id} ref={questionRefs.current[i]} style={{ marginBottom: 24 }}>
            {/* заголовок + картинка */}
            <strong>
              {i + 1}. {q.question}{" "}
              <span style={{ fontWeight: "normal", fontSize: 14 }}>
                ({q.points || 1} point{(q.points || 1) !== 1 ? "s" : ""})
              </span>
            </strong>

            {q.imageurl && (
              <img
                src={q.imageurl}
                alt=""
                style={{
                  display: "block",   /* новая строка */
                  maxWidth: 200,
                  margin: "8px 0",    /* сверху/снизу отступ, слева 0  */
                  borderRadius: 6
                }}
              />
            )}
            <MatchingQuestion
              question={q}
              answer={answers}
              setAnswer={setAnswers}
              disabled={expired || !!result}
            />
          </div>
        );
      }

      if (q.type === "open") {
        return (
          <div key={q.id} ref={questionRefs.current[i]} style={{ marginBottom: 24 }}>
            <strong>{i + 1}. {q.question}{" "}
              <span style={{ fontWeight: "normal", fontSize: 14 }}>
                ({q.points || 1} point{(q.points || 1) !== 1 ? "s" : ""})
              </span></strong>
            {q.imageurl && (
              <img
                src={q.imageurl}
                alt=""
                style={{
                  display: "block",   /* перенос на новую строку */
                  maxWidth: 200,
                  margin: "8px 0",    /* сверху/снизу отступ, слева 0 */
                  borderRadius: 6
                }}
              />
            )}
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: e.target.value,
                }))
              }
              disabled={expired || !!result}
              style={{
                marginTop: 8,
                padding: 6,
                fontSize: 16,
                width: "100%",
                maxWidth: 400,
                boxSizing: "border-box",
              }}
            />
            {result && (
  <div style={{ marginTop: 6 }}>
    {(answers[q.id] || "").trim().toLowerCase() ===
    (q.correct_answer_text || "").trim().toLowerCase() ? (
      <span style={{ color: "green" }}>✅ Верно</span>
    ) : (
      <span style={{ color: "red" }}>
        ❌ Неверно. Правильный ответ: <strong>{q.correct_answer_text}</strong>
      </span>
    )}
  </div>
)}

          </div>
        );
      }

      const isMultiple = q.type === "multiple";
      return (
        <div key={q.id} ref={questionRefs.current[i]} style={{ marginBottom: 16 }}>
          <strong>{i + 1}. {q.question}{" "}
              <span style={{ fontWeight: "normal", fontSize: 14 }}>
                ({q.points || 1} point{(q.points || 1) !== 1 ? "s" : ""})
              </span></strong>
          {q.imageurl && (
            <img
              src={q.imageurl}
              alt=""
              style={{
                display: "block",   /* перенос на новую строку */
                maxWidth: 200,
                margin: "8px 0",    /* сверху/снизу отступ, слева 0 */
                borderRadius: 6
              }}
            />
          )}
          {q.options.map((opt, idx) => {
            const checked = isMultiple
              ? (answers[q.id] || []).includes(idx)
              : answers[q.id] === idx;

            const wasAnswered = !!result; 

            const isCorrect = isMultiple
              ? (q.correct_option_indexes || []).includes(idx)
              : q.correct_option_index === idx;

            const isWrongSelected = wasAnswered && checked && !isCorrect;

            const icon = wasAnswered
            ? isCorrect && checked
              ? " ✅"                    //правильный и выбран — зелёный
              : isCorrect && !checked
                ? " ☑️"                  //правильный, но НЕ выбран — серый
              : isWrongSelected
                ? " ❌"                  //выбранный, но неправильный — красный
              : ""
            : "";


            return (
              <label
                key={idx}
                style={{ display: "flex", alignItems: "center", marginTop: 4 }}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  checked={checked}
                  disabled={expired || !!result}
                  onChange={() => handleChange(q.id, idx, isMultiple)}
                  style={{ marginRight: 8 }}
                />
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* текст / подпись */}
                      {typeof opt === "string" ? opt : opt.text}
                  
                      {/* галочка / крестик после проверки */}
                      {icon}
                    </span>
              </label>
            );
          })}
        </div>
      );
    })}

      
      {!result && (
        <button
          onClick={computeResult}
          style={{ marginTop: 12 }}
        >
          Submit
        </button>
      )}

      {result && !!user?.userrole && user.userrole === 1 && (
        <button
          onClick={() => navigate("/student")}
          style={{
            marginTop: 24,
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "6px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Закрыть квиз
        </button>
      )}
    </div>
  );
}

export default Quiz;
