/* This test verifies the entire flow of:
 - selecting an answer
 - clicking Submit
 - seeing the score appear.
 It ensures the quiz scoring logic works end-to-end. */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Quiz from "./Quiz";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//mock useAuth to simulate a logged-in student
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));


describe("Integration: Quiz", () => {
  it("shows score after submitting", () => {
    useAuth.mockReturnValue({
      user: { userrole: 2 } 
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
    //select the first option
    fireEvent.click(screen.getByLabelText(/A/i));

    //submit answers
    fireEvent.click(screen.getByText(/submit/i));

    //verify the score appears
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
  });
});
