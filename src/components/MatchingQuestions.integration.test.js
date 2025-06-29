// MatchingQuestion.integration.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import MatchingQuestion from "../components/MatchingQuestions";
import '@testing-library/jest-dom';

const questionMock = {
  id: 1,
  left_items: ["L1","L2"],
  right_items: ["R1","R2"]
};

describe("Integration: MatchingQuestion", () => {
  it("рендерит все варианты для сопоставления", () => {
    render(
      <MatchingQuestion
        question={questionMock}
        answer={{}}
        setAnswer={() => {}}
        disabled={false}
      />
    );

    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("R2")).toBeInTheDocument();
  });
});
