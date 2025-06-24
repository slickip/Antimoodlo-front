import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import MatchingQuestion from "./MatchingQuestions";
import { FiX, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Преобразует ISO-строку в Date с учётом Москвы
function parseMoscow(iso) {
  if (iso instanceof Date || typeof iso === "number") return new Date(iso);
  if (typeof iso !== "string") iso = String(iso);
  if (/[+\\-]\\d{2}:\\d{2}$|Z$/.test(iso)) return new Date(iso);
  const [date, time] = iso.split("T");
  const [Y, M, D] = date.split("-").map(Number);
  const [h, m, s = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(Y, M - 1, D, h - 3, m, s));
}

// Текущее время по Москве
function getNowMoscow() {
  const nowLocal = new Date();
  const offsetLocalMin = nowLocal.getTimezoneOffset();
  const offsetMoscowMin = 3 * 60;
  const deltaMs = (offsetMoscowMin + offsetLocalMin) * 60_000;
  return new Date(nowLocal.getTime() + deltaMs);
}

function Quiz({ quizConfig }) {
  //объект, где хранятся все ответы пользователя: answers[q.id] 
  const [answers, setAnswers]     = useState({});
  //результат типо "Правильно x ответов из y"
  const [result, setResult]       = useState(null);
  //флаг, указывающий на вышедшее время
  const [isTimeUp, setIsTimeUp]   = useState(false);
  const navigate = useNavigate();

  //база квиза
  const { start, end, title, description, questions, duration } = quizConfig.quiz;

  //время и дедлайн
  const startDate = parseMoscow(start);
  const endDate   = parseMoscow(end);
  const nowMoscow = getNowMoscow();
  const expired   = nowMoscow > endDate || isTimeUp;

  
  //compareResult() подсчитывает количество правильных ответов
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
    } else if (q.type === "multiple") {
      const a = Array.isArray(given) ? given.slice().sort().toString() : "";
const b = Array.isArray(q.correct_option_indexes) ? q.correct_option_indexes.slice().sort().toString() : "";
if (a === b) correctCount++;
    } else if (q.type === "open") {
      const givenText = (given || "").trim().toLowerCase();
      const correctText = (q.correct_answer_text || "").trim().toLowerCase();
      if (givenText === correctText) {
        correctCount++;
      }
    }
  });

  setResult(`✅ Correct: ${correctCount} out of ${questions.length}`);
};


  //useEffect() используется для автоматической остановки квиза, если сгорел дедлайн
  useEffect(() => {
    if (result) return; //если уже посчитали — не продолжаем
    const id = setInterval(() => {
      if (getNowMoscow() > endDate) {
        setIsTimeUp(true); 
        computeResult();
        clearInterval(id);
      }
    }, 500); //проверка каждые полсекунды
    return () => clearInterval(id); 
  }, [endDate, questions, answers, result]);

  //useEffect() используется для автоматической остановки квиза, если закончилось время на таймере
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
  

  /*handleChange() используется для обработки выбора ответов 
  ***********************
  ничего не делает если квиз закончился из-за isTimeUp()
  ***********************
  Если вопрос с множественным выбором (multiple), то добавляет или удаляет optionIndex из списка выбранных.
  ***********************
  Если вопрос с одиночным выбором (single), то просто устанавливает номер выбранного варианта. */
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

    {/* Показываем таймер до тех пор, пока нет результата */}
    {!result && !isTimeUp && (
      <Timer duration={duration} onTimeUp={() => setIsTimeUp(true)} />
    )}

    {/* Показываем результат, если он есть */}
    {result && (
      <p style={{ fontWeight: "bold", marginTop: 12 }}>{result}</p>
    )}

    {/* ВСЕГДА показываем вопросы */}
    {questions.map((q, i) => {
      if (q.type === "matching") {
        return (
          <div key={q.id} style={{ marginBottom: 24 }}>
            <strong>{i + 1}. {q.question}</strong>
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
          <div key={q.id} style={{ marginBottom: 24 }}>
            <strong>{i + 1}. {q.question}</strong>
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
        <div key={q.id} style={{ marginBottom: 16 }}>
          <strong>{i + 1}. {q.question}</strong>
          {q.image && (
            <img
              src={q.image}
              alt=""
              style={{ maxWidth: 400, margin: "8px 0", borderRadius: 6 }}
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
                      {/* картинка, если есть */}
                      {typeof opt !== "string" && opt.image && (
                        <img
                          src={opt.image}
                          alt=""
                          style={{ maxWidth: 120, borderRadius: 4 }}
                        />
                      )}
                      {/* галочка / крестик после проверки */}
                      {icon}
                    </span>
              </label>
            );
          })}
        </div>
      );
    })}

    {/* Кнопка "Проверить ответы" — только если еще не было ответа */}
    {!result && (
      <button
        onClick={() => setIsTimeUp(true)}
        style={{ marginTop: 12 }}
      >
        Submit
      </button>
    )}

    {result && (
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