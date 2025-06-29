/*This test checks the main editing flow of the EditorForQuestion component.
It focuses on verifying that users can edit the question text 
and that the component emits an update event with the new data.*/
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorForQuestion from './EditorForQuestion';

//sample question data used in the test
const sampleQ = {
  id: 1,
  question: 'Old?',
  type: 'single',
  options: ['A','B'],
  correct_option_index: 0
};

describe('<EditorForQuestion />', () => {
  it('edit text and calls onUpdate()', () => {
    //create mock functions to track calls to onUpdate() and onDelete()
    const onUpdate = jest.fn();
    const onDelete = jest.fn();
    //куnder the component with the sample question and mocks
    render(
      <EditorForQuestion
        question={sampleQ}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

     //click the "Edit" button to switch to edit mode
    fireEvent.click(screen.getByText(/Edit/i));

    //find the input pre-filled with the original question text
    const input = screen.getByDisplayValue('Old?');

    //change the text value to a new question text
    fireEvent.change(input, { target: { value: 'New?' } });

    //click the "Save" button to confirm the edit
    fireEvent.click(screen.getByText(/Save/i));

    /* Verify that onUpdate was called exactly once
    and received an object containing the updated question text */
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ question: 'New?' })
    );
  });
});
