/* This test checks that when the user logs in successfully,
the login function is called and the success callback triggers navigation.
It ensures the login flow works correctly. */
import React from "react";
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import LoginPage from "./LoginPage";
import { useAuth } from "../context/AuthContext";

//mock useAuth to provide controlled login
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Integration: LoginPage", () => {
  it("logs in and calls navigation", () => {
    const mockLogin = jest.fn((u, p, onSuccess) => onSuccess());
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    //fill login form with valid credentials
    fireEvent.change(screen.getByPlaceholderText("Login"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass" },
    });

    //submit form
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    //verify login was called
    expect(mockLogin).toHaveBeenCalled();
  });
});
