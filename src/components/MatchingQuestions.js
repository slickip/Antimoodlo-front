import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function MatchingQuestion({ question, answer, setAnswer, disabled }) {
  const { id, left_items, right_items } = question;

  const handleDrop = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const leftItem = destination.droppableId;
    setAnswer(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [leftItem]: draggableId
      }
    }));
  };

  const usedRightItems = Object.values(answer?.[id] || {});
  const availableRightItems = right_items.filter(opt => !usedRightItems.includes(opt));

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginTop: "16px" }}>
        {/* Левый столбец с зонами для перетаскивания */}
        <div>
          <h4>Match to:</h4>
          {left_items.map((left, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong>{left}</strong>
              <Droppable droppableId={left} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minWidth: 150,
                      minHeight: 40,
                      border: "1px dashed #ccc",
                      padding: 4,
                      background: "#f9f9f9",
                      marginTop: 4
                    }}
                  >
                    {answer?.[id]?.[left] && (
                      <Draggable
                        draggableId={answer[id][left]}
                        index={0}
                        isDragDisabled={disabled}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: "6px 12px",
                              background: "#e0f7ff",
                              borderRadius: 4,
                              ...provided.draggableProps.style
                            }}
                          >
                            {answer[id][left]}
                          </div>
                        )}
                      </Draggable>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        {/* Правый столбец со всеми доступными опциями */}
        <div>
          <h4>Options:</h4>
          <Droppable droppableId="options" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minWidth: 150,
                  border: "1px solid #ccc",
                  padding: 8,
                  background: "#fff"
                }}
              >
                {availableRightItems.map((opt, index) => (
                  <Draggable
                    key={opt}
                    draggableId={opt}
                    index={index}
                    isDragDisabled={disabled}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "6px 12px",
                          background: "#d4f8d4",
                          borderRadius: 4,
                          marginBottom: 6,
                          ...provided.draggableProps.style
                        }}
                      >
                        {opt}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
}

export default MatchingQuestion;
