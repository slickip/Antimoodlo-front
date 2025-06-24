import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Quiz from "../components/Quiz";
import api from "../services/Api";
import "../styles/ConfigUploadPage.css";


export default function QuizPage() {
  const { quizId } = useParams();
  const [quizConfig, setQuizConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(60);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // a) метаданные квиза
        const { data: quizData } = await api.getQuiz(quizId);
        // b) список вопросов (id + text + type)
        const { data: questionsList } = await api.getQuestions(quizId);
        // c) подтягиваем для каждого детали через новый метод:
        const questions = await Promise.all(
          questionsList.map(async q => {
            const { data: ans } = await api.getAllAnswers(q.id);
            const { options, correctAnswers, matchPairs, openAnswers } = ans;

            // определяем тип
            let type = "single";
            if      (matchPairs.length)         type = "matching";
            else if (openAnswers.length)        type = "open";
            else if (correctAnswers.length > 1) type = "multiple";

            // тексты опций
            const optTexts = options.map(o => o.optiontext);

            // вычисляем правильные индексы
            let correctIndex;
            let correctIndexes = [];
            if (type === "single") {
              correctIndex = optTexts.findIndex(
                (_, i) => options[i].id === correctAnswers[0]?.optionid
              );
            } else if (type === "multiple") {
              correctIndexes = correctAnswers
                .map(ca => ca.optionid)
                .map(oid => optTexts.findIndex((_, i) => options[i].id === oid))
                .filter(i => i !== -1)
                .sort();
            }

            // пары для matching
            const correctMatches = matchPairs.reduce((acc, m) => {
              acc[m.lefttext] = m.righttext;
              return acc;
            }, {});

            // текст для open
            const correctAnswerText = openAnswers[0]?.answertext || "";

            return {
              id: q.id,
              question: q.questiontext,
              type,
              ...(type !== "matching" && type !== "open" && { options: optTexts }),
              ...(type === "single"   && { correct_option_index:   correctIndex }),
              ...(type === "multiple" && { correct_option_indexes: correctIndexes }),
              ...(type === "matching" && { correct_matches:        correctMatches }),
              ...(type === "open"     && { correct_answer_text:    correctAnswerText }),
            };
          })
        );

        setQuizConfig({
          quiz: {
            id:          quizData.id,
            title:       quizData.title,
            description: quizData.description,
            start:       quizData.startdate,
            end:         quizData.enddate,
            duration:    quizData.duration,
            questions
          }
        });
      } catch (err) {
        console.error("Не удалось загрузить квиз:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading) {
    return (
      <div className="quiz-creator-container">
        <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />
        <div className="main-content" style={{ marginLeft: sidebarWidth, padding: 24 }}>
          Загрузка квиза…
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-creator-container">
      <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />
      <div className="main-content" style={{ marginLeft: sidebarWidth, padding: 24 }}>
        {quizConfig
          ? <Quiz quizConfig={quizConfig} />
          : <p>Не удалось загрузить вопросы.</p>
        }
      </div>
    </div>
  );
}
