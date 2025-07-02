
import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";
import Sidebar from "../components/Sidebar";
import "../styles/ConfigUploadPage.css"; 


function StudentPage() {
  const [sidebarWidth, setSidebarWidth] = useState(60);
  const [quizzes, setQuizzes]         = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.getQuizzes();
        setQuizzes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);
  console.log("Квизы:", quizzes);

  return (
  <div className="quiz-creator-container">
    <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />

    <div className="main-content" style={{ marginLeft: sidebarWidth }}>
      <div className="header-container">
        <h1 className="page-title">Добро пожаловать, {user?.userlogin}!</h1>
      </div>

      {/* Список квизов */}
      {isLoading ? (
        <p>Загрузка квизов…</p>
      ) : quizzes.length === 0 ? (
        <p>Пока нет доступных квизов</p>
      ) : (
        <div className="quizzes-list">
          {quizzes.map(q => {
            const now = new Date();
            const end = new Date(q.enddate || q.end);
            const expired = now > end;

            const isStudent = user?.userrole === 1;

            return (
              <div key={q.id} className="quiz-item">
                <h3 className="quiz-title">{q.title}</h3>
                <p className="quiz-description">{q.description}</p>

                {isStudent && expired ? (
                  <p style={{ color: "rgba(1, 5, 40, 0.8)", fontWeight: "bold" }}>
                    Дедлайн прошёл: {end.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}
                  </p>
                ) : (
                  
                  <button
                    className="action-btn start-quiz-btn"
                    onClick={() => navigate(`/student/quiz/${q.id}`)}
                  >
                    Начать квиз
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={logout} className="action-btn logout-btn">
        Выйти
      </button>
    </div>
  </div>
);
}

export default StudentPage;
