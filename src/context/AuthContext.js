import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api"; // путь зависит от структуры проекта

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("user"));
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
  try {
    const response = await api.getUsers();
    const users = response.data;

    const user = users.find(
      (u) => u.userlogin === username && u.userpassword === password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      navigate("/upload");
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
