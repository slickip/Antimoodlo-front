import React from "react";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiUpload, FiEye } from "react-icons/fi";

function Sidebar() {
  const { logout } = useAuth();

  const sidebarStyle = {
    height: "100vh",
    width: "60px",
    backgroundColor: "rgba(1, 5, 40, 0.8)", // #010528 с прозрачностью 0.8
    color: "#fff",
    transition: "width 0.3s ease, background-color 0.3s ease",
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

  const sectionStyle = {
    padding: "20px 10px",
  };

  return (
    <div
      style={sidebarStyle}
      onMouseEnter={(e) => (e.currentTarget.style.width = "200px")}
      onMouseLeave={(e) => (e.currentTarget.style.width = "60px")}
    >
      <div style={sectionStyle}>
        <SidebarItem icon={<FiUpload />} label="Upload" />
        <SidebarItem icon={<FiEye />} label="Quizzes" />
      </div>
      <div style={sectionStyle}>
        <SidebarItem icon={<FiLogOut />} label="Logout" onClick={logout} />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick }) {
  const itemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background 0.2s ease",
    color: "#fff", // текст белый
  };

  const iconStyle = {
    fontSize: "20px",
    marginRight: "12px",
    minWidth: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff", // иконки белые
  };

  const labelStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.background = "#010528"; // фон при ховере полностью непрозрачный
    const labelSpan = e.currentTarget.querySelector("span");
    if (labelSpan) labelSpan.style.opacity = 1;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = "transparent"; // возвращаем прозрачность
    const labelSpan = e.currentTarget.querySelector("span");
    if (labelSpan) labelSpan.style.opacity = 0;
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div style={iconStyle}>{icon}</div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

export default Sidebar;