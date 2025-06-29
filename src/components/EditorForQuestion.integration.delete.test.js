// EditorForQuestion.integration.delete.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditorForQuestion from "../components/EditorForQuestion";

const sampleQ = {
  id: 1,
  question: "Delete me?",
  type: "single",
  options: ["A"],
  correct_option_index: 0,
};

describe("Integration: EditorForQuestion delete", () => {
  it("вызывает onDelete при клике Delete", () => {
    const onDelete = jest.fn();
    render(
      <EditorForQuestion
        question={sampleQ}
        onUpdate={() => {}}
        onDelete={onDelete}
      />
    );

    // Здесь исправили!
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
