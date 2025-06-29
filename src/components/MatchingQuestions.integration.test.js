/* This test verifies that the MatchingQuestion component
renders all left and right items passed in props.
It ensures users will see all options to match. */
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
  it("renders all matching options", () => {
    render(
      <MatchingQuestion
        question={questionMock}
        answer={{}}
        setAnswer={() => {}}
        disabled={false}
      />
    );

    //assert left items are displayed
    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
    //assert right items are displayed
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("R2")).toBeInTheDocument();
  });
});
