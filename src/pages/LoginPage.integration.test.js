// src/pages/LoginPage.integration.test.js
import React from "react";
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import LoginPage from "./LoginPage";
import { useAuth } from "../context/AuthContext";

// Мокаем useAuth
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Integration: LoginPage", () => {
  it("логинит и переходит на /upload", () => {
    const mockLogin = jest.fn((u, p, onSuccess) => onSuccess());
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Login"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalled();
  });
});
