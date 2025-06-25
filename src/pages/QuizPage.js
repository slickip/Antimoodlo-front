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
        const preview = await api.loadQuizPreview(quizId);
        setQuizConfig({ quiz: preview });
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
