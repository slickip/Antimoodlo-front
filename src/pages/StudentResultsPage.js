import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/Api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ConfigUploadPage.css";

export default function StudentResultsPage() {
  const [grades, setGrades] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(60);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const allGrades = await api.getGrades();
      const myGrades = allGrades.data.filter(g => g.userid === user.userid);
      setGrades(myGrades);

      const allQuizzes = await api.getQuizzes();
      setQuizzes(allQuizzes.data);
    };
    load();
  }, [user]);

  const quizMap = new Map(quizzes.map(q => [q.id, q.title]));

  return (
    <div className="quiz-creator-container">
      <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />

      <div className="main-content" style={{ marginLeft: sidebarWidth }}>
        <div className="header-container">
            <h1 className="page-title">Results</h1>
        </div>

        <div className="tab-container">
            <button
            className="tab-button inactive"
            onClick={() => navigate("/student")}
            >
            Quizzes
            </button>
            <button
            className="tab-button active"
            onClick={() => navigate("/student/results")}
            >
            Grades
            </button>
        </div>

        {grades.length === 0 ? (
            <p>Вы ещё не проходили квизы.</p>
        ) : (
            <table className="results-table">
            <thead>
                <tr>
                <th>Quiz</th>
                <th>Points</th>
                </tr>
            </thead>
            <tbody>
                {grades.map(g => (
                <tr key={g.id}>
                    <td>{quizMap.get(g.quizid) || `Квиз #${g.quizid}`}</td>
                    <td>{g.points}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>

    </div>
  );
}
