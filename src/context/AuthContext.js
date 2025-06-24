import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api"; // путь зависит от структуры проекта


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("user"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      const role = user.userrole;
      if (role === 1)       navigate("/student");
      else if (role === 2|| role === 3) navigate("/upload");
    }
  }, [user, navigate]);


  const login = async (username, password) => {
  try {
    const response = await api.getUsers();
    const users = response.data;

    const found = users.find(
      (u) => u.userlogin === username && u.userpassword === password
    );

    if (found) {
      localStorage.setItem("user", JSON.stringify(found));
      setUser(found);
      setIsAuthenticated(true);

      // Перенаправляем по роли
      switch (found.userrole) {
        case 1:
          navigate("/student");   // ваша страница для студентов
          break;
        case 2:
        case 3:
          navigate("/teacher");   // или как у вас называется страница преподавателей
          break;
        default:
          navigate("/");          // всё равно куда-то на корень
      }
    } else {
      alert("Неверный логин или пароль");
    }
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    alert("Ошибка при подключении к серверу");
  }
};



  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
