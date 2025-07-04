// components/Sidebar.js
import React from "react";
import { FiLogOut, FiUpload, FiEye, FiBarChart2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Sidebar({ width = 60, setWidth, onNavigate }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isStudent = user?.userrole === 1;      // 1 = student
  const open  = () => setWidth?.(200);
  const close = () => setWidth?.(60);

  const sidebarStyle = {
    height: "100vh",
    width,                               // ← получаем из пропса
    backgroundColor: "rgba(1, 5, 40, 0.8)",
    color: "#fff",
    transition: "width 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 10,
    boxShadow: "4px 0 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  };

  const sectionStyle = { padding: "20px 10px" };

  /* ————————— helpers ————————— */

  return (
    <div style={sidebarStyle} onMouseEnter={open} onMouseLeave={close}>
      {/* верхний блок */}
      <div style={sectionStyle}>
        {isStudent ? (
          /* ===== Студент ===== */
          <>
            {/* Grades */}
            <SidebarItem
              icon={<FiBarChart2 />}
              label="Grades"
              onClick={() => navigate("/student/results")}
            />
            {/* Quizzes */}
            <SidebarItem
              icon={<FiEye />}
              label="Quizzes"
              onClick={() => navigate("/student")}
            />
          </>
        ) : (
          /* ===== Учитель / Админ ===== */
          <>
            {/* Upload */}
            <SidebarItem
              icon={<FiUpload />}
              label="Upload"
              onClick={() => onNavigate?.("upload")}
            />
            {/* Quizzes */}
            <SidebarItem
              icon={<FiEye />}
              label="Quizzes"
              onClick={() => onNavigate?.("saved")}
            />
          </>
        )}
      </div>

      {/* выход */}
      <div style={sectionStyle}>
        <SidebarItem icon={<FiLogOut />} label="Logout" onClick={logout} />
      </div>
    </div>
  );
}

/* один пункт меню */
function SidebarItem({ icon, label, onClick }) {
  const itemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background 0.2s ease",
    color: "#fff",
  };

  const iconStyle = {
    fontSize: 20,
    marginRight: 12,
    minWidth: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const labelStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    /* подпись всегда видна */
  };

  return (
    <div
      style={itemStyle}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = "#010528")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={iconStyle}>{icon}</div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

export default Sidebar;