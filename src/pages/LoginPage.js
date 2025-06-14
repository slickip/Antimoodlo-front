import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css";
import logo from "../images/IUlogo.png";
import logo2 from "../images/logo_mini.png";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(
      username,
      password,
      () => navigate("/upload"),
      () => alert("Неверный логин или пароль")
    );
  };

  return (
    <div className="page">
      <header className="top-bar">
        <img src={logo2} alt="IU Logo" />
        <div className="email">
          E-mail :{" "}
          <a href="mailto:university@innopolis.ru">university@innopolis.ru</a>
        </div>
      </header>

      <main className="card">
        <div className="logo-section">
          <img src={logo} alt="IU Logo" className="logo" />
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log in</button>
        </form>

        <footer>©Antimoodlo</footer>
      </main>
    </div>
  );
};

export default LoginPage;