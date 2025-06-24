import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ConfigUploadPage from "./pages/ConfigUploadPage";
import StudentPage from "./pages/StudetPage";     // добавь это
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Страница входа */}
        <Route path="/" element={<LoginPage />} />

        {/* Страница загрузки (преподаватели) */}
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <ConfigUploadPage />
            </PrivateRoute>
          }
        />

        {/* Новая: страница для студентов */}
        <Route
          path="/student"
          element={
            <PrivateRoute>
              <StudentPage />
            </PrivateRoute>
          }
        />

        
      </Routes>
    </AuthProvider>
  );
}

export default App;
