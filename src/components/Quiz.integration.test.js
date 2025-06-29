import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Quiz from "./Quiz";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// МОКАЕМ useAuth
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Тест
describe("Integration: Quiz", () => {
  it("показывает результат после Submit", () => {
    useAuth.mockReturnValue({
      user: { userrole: 2 } // студент
    });

    const quizMock = {
      quiz: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 60_000).toISOString(),
        title: "Demo Quiz",
        description: "Test description",
        duration: 10,
        questions: [
          { id: 1, question: "Q1?", type: "single", options: ["A","B"], correct_option_index: 0 }
        ]
      }
    };

    render(
      <MemoryRouter>
        <Quiz quizConfig={quizMock}/>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText(/A/i));
    fireEvent.click(screen.getByText(/submit/i));

    expect(screen.getByText(/Score/i)).toBeInTheDocument();
  });
});
