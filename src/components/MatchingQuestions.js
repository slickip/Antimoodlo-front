import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function MatchingQuestion({ question, answer, setAnswer, disabled }) {
  const { id, left_items, right_items } = question;

  const handleDrop = (result) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  setAnswer(prev => {
    const current = { ...(prev[id] || {}) };

    // Удаляем draggableId из всех связей (в любом случае)
    for (const key in current) {
      if (current[key] === draggableId) {
        delete current[key];
      }
    }

    // Если переместили не в options, то записываем новый match
    if (destination.droppableId !== "options") {
      current[destination.droppableId] = draggableId;
    }

    return {
      ...prev,
      [id]: current
    };
  });
};


  const usedRightItems = Object.values(answer?.[id] || {});
  const availableRightItems = right_items.filter(opt => !usedRightItems.includes(opt));

  // Ограничиваем количество левых
  const visibleLeftItems = left_items.slice(0, right_items.length);

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <div style={{ display: "flex", gap: "32px", marginTop: 16 }}>
        {/* Левая часть: пары */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", fontWeight: "bold", marginBottom: 8 }}>
            <div style={{ width: "150px" }}>Match to:</div>
            <div>Answer:</div>
          </div>

          {visibleLeftItems.map((left, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: "150px" }}>
                <strong>{left}</strong>
              </div>
              <Droppable droppableId={left} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minWidth: 180,
                      minHeight: 40,
                      border: "1px dashed #ccc",
                      background: "#f9f9f9",
                      padding: 4,
                      display: "flex",
                      alignItems: "center"
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              ...provided.draggableProps.style
                            }}
                          >
                            <span>{answer[id][left]}</span>
                            {disabled && question.correct_matches && (
                              <span style={{ marginLeft: 8 }}>
                                {answer[id][left] === question.correct_matches[left] ? "✅" : "❌"}
                              </span>
                            )}
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

        {/* Правая часть: Options */}
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Options:</div>
          <Droppable droppableId="options" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  width: 180,
                  minHeight: right_items.length * 48,
                  border: "1px solid #ccc",
                  padding: 8,
                  background: "#fff"
                }}
              >
                {availableRightItems.map((opt, index) => (
                  <Draggable
                    key={`${opt}-${index}`}
                    draggableId={`${question.id}-${opt}-${index}`}
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
