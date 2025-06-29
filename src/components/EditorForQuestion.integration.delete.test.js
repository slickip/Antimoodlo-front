/*This test verifies that clicking the "Delete" button
correctly calls the provided `onDelete` function.
This ensures the delete button triggers the removal logic.*/
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
  it("calls onDelete() when Delete button is clicked", () => {
    const onDelete = jest.fn(); //mock function to track calls
    render(
      <EditorForQuestion
        question={sampleQ}
        onUpdate={() => {}}
        onDelete={onDelete}
      />
    );

    //click the Delete button (using role and accessible name)
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    //verify that onDelete was called
    expect(onDelete).toHaveBeenCalled();
  });
});
