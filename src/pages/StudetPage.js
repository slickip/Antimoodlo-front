import React from "react";
import { useAuth } from "../context/AuthContext";

function StudentPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "24px" }}>
      <h1>Добро пожаловать, {user?.userlogin}!</h1>
      <p>Ваша роль: {user?.userrole === 1 ? "Студент" : "Преподаватель"}</p>

      <button onClick={logout} style={{
        marginTop: "20px",
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#c0392b",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}>
        Выйти из аккаунта
      </button>
    </div>
  );
}

export default StudentPage;
