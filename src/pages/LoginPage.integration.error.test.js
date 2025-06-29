// LoginPage.integration.error.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Integration: LoginPage errors", () => {
  it("вызывает alert при ошибке логина", () => {
    const mockLogin = jest.fn((u, p, onSuccess, onError) => onError());
    useAuth.mockReturnValue({ login: mockLogin });
    window.alert = jest.fn();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Login"), { target: { value: "bad" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button"));

    expect(window.alert).toHaveBeenCalledWith("Неверный логин или пароль");
  });
});
