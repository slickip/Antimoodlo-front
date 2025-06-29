/* This test checks that when login fails,
 the error callback triggers an alert with the correct message.
 It validates error handling UX for failed logins. */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//mock useAuth to control login behavior
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Integration: LoginPage errors", () => {
  it("shows alert on login error", () => {
    const mockLogin = jest.fn((u, p, onSuccess, onError) => onError());
    useAuth.mockReturnValue({ login: mockLogin });
    window.alert = jest.fn(); //mock alert

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    //fill login form with wrong credentials
    fireEvent.change(screen.getByPlaceholderText("Login"), { target: { value: "bad" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "bad" } });

    //submit form
    fireEvent.click(screen.getByRole("button"));

    //verify alert was called
    expect(window.alert).toHaveBeenCalledWith("Неверный логин или пароль");
  });
});
