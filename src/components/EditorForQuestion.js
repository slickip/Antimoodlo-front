import React, { useState } from "react";
import { FiTrash2, FiSave, FiPlus } from "react-icons/fi";
import PropTypes from "prop-types";

/*
*Компонент для редактирования уже добавленного вопроса.
- question: объект вопроса ({ id, question, type, ... })
- onUpdate: функция(updatedQuestion) при сохранении
- onDelete: функция() при удалении
*/
export default function EditorForQuestion({ question, onUpdate, onDelete }) {
  const [local, setLocal] = useState({ ...question });
  const [isEditing, setIsEditing] = useState(false);

  //Обновляет опцию (single/multiple) по индексу
  const updateOption = (index, value) => {
    setLocal(prev => {
      const opts = [...(prev.options || [])];
      opts[index] = value;
      return { ...prev, options: opts };
    });
  };

  //Добавляет новую опцию
  const addOption = () => {
    setLocal(prev => ({
      ...prev,
      options: [...(prev.options || []), ""]
    }));
  };

  //Удаляет опцию по индексу
  const removeOption = index => {
    setLocal(prev => {
      const opts = prev.options.filter((_, i) => i !== index);
      let corr = prev.correct_option_indexes || [];
      if (prev.type === "single") {
        if (prev.correct_option_index === index) {
          corr = null;
        }
      } else {
        corr = corr.filter(i => i !== index);
      }
      return {
        ...prev,
        options: opts,
        correct_option_indexes: prev.type === "multiple" ? corr : undefined,
        correct_option_index: prev.type === "single" ? corr : undefined
      };
    });
  };

  const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: '#292E52',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  transition: 'opacity 0.3s, background-color 0.3s',
  display: 'flex',
  alignItems: 'center',
  gap: 8
};


  //Обработчик выбора правильного ответа
  const handleCorrectAnswerChange = (idx, checked) => {
    setLocal(prev => {
      if (prev.type === "single") {
        return { ...prev, correct_option_index: idx };
      }
      // multiple
      const existing = prev.correct_option_indexes || [];
      return {
        ...prev,
        correct_option_indexes: checked
          ? [...existing, idx]
          : existing.filter(i => i !== idx)
      };
    });
  };

  //Обработчик изменения текста вопроса
  const handleQuestionTextChange = e => {
    setLocal(prev => ({ ...prev, question: e.target.value }));
  };

  //Обновление open-answer текста
  const handleOpenAnswerChange = e => {
    setLocal(prev => ({ ...prev, correct_answer_text: e.target.value }));
  };

  //Matching: обновление left/right и матчей
  const updateLeft = (idx, value) => {
    setLocal(prev => {
      const left = [...prev.left_items]; left[idx] = value;
      return { ...prev, left_items: left };
    });
  };
  const updateRight = (idx, value) => {
    setLocal(prev => {
      const right = [...prev.right_items]; right[idx] = value;
      return { ...prev, right_items: right };
    });
  };
  const addLeft = () =>
  setLocal(prev => ({
    ...prev,
    left_items: [...prev.left_items, ""]
  }));

const addRight = () =>
  setLocal(prev => ({
    ...prev,
    right_items: [...prev.right_items, ""]
  }));

  const handleMatchSelect = (left, right) => {
    setLocal(prev => ({
      ...prev,
      correct_matches: { ...prev.correct_matches, [left]: right }
    }));
  };

if (isEditing) {
  return (
<div
  style={{
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }}
>
  {/* Вопрос */}
  <div>
    <label style={{ fontWeight: 'bold' }}>Question:</label>
    <input
      type="text"
      value={local.question}
      onChange={handleQuestionTextChange}
      style={{
        width: '100%',
        padding: 8,
        border: '1px solid #ccc',
        borderRadius: 6,
        marginTop: 4
      }}
    />
    {/* Image URL */}
    <div style={{ marginTop: 8 }}>
      <label style={{ fontWeight: "bold" }}>Image URL:</label>
      <input
        type="text"
        value={local.imageurl || ""}
        onChange={(e) =>
          setLocal((p) => ({ ...p, imageurl: e.target.value.trim() }))
        }
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 6,
          marginTop: 4,
        }}
        placeholder="https://example.com/pic.png"
      />
      {local.imageurl && (
        <img
          src={local.imageurl}
          alt=""
          style={{ maxHeight: 80, marginTop: 6, borderRadius: 6 }}
        />
      )}
    </div>
  </div>

  {/* Тип */}
  <div>
    <strong>Type: {local.type}</strong>
  </div>

  {/* Open answer */}
  {local.type === 'open' && (
    <div>
      <label style={{ fontWeight: 'bold' }}>Open answer:</label>
      <input
        type="text"
        value={local.correct_answer_text || ''}
        onChange={handleOpenAnswerChange}
        style={{
          width: '100%',
          padding: 8,
          border: '1px solid #ccc',
          borderRadius: 6,
          marginTop: 4
        }}
      />
    </div>
  )}

  {/* Single / multiple options */}
  {(local.type === 'single' || local.type === 'multiple') && (
    <div>
      <label style={{ fontWeight: 'bold' }}>Options:</label>
      {local.options.map((opt, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6
          }}
        >
          <input
            type={local.type === 'single' ? 'radio' : 'checkbox'}
            checked={
              local.type === 'single'
                ? local.correct_option_index === idx
                : (local.correct_option_indexes || []).includes(idx)
            }
            onChange={e => handleCorrectAnswerChange(idx, e.target.checked)}
          />
          <input
            type="text"
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 6,
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={() => removeOption(idx)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'red'
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        style={buttonStyle}
      >
        <FiPlus size={14} />
        Add option
      </button>
    </div>
  )}

  {/* Matching */}
  {local.type === 'matching' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {/* Left Column */}
    <div>
      <label style={{ fontWeight: 'bold' }}>Left Column:</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {local.left_items.map((item, idx) => (
          <input
            key={idx}
            type="text"
            value={item}
            onChange={e => updateLeft(idx, e.target.value)}
            placeholder={`Left ${idx + 1}`}
            style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
          />
        ))}
        <button
          onClick={addLeft}
          disabled={local.left_items.length >= local.right_items.length}
          style={buttonStyle}
        >
          <FiPlus size={14} /> Add Left
        </button>
      </div>
    </div>

    {/* Right Column */}
    <div>
      <label style={{ fontWeight: 'bold' }}>Right Column:</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {local.right_items.map((item, idx) => (
          <input
            key={idx}
            type="text"
            value={item}
            onChange={e => updateRight(idx, e.target.value)}
            placeholder={`Right ${idx + 1}`}
            style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
          />
        ))}
        <button
          onClick={addRight}
          disabled={local.right_items.length > local.left_items.length + 5}
          style={buttonStyle}
        >
          <FiPlus size={14} /> Add Right
        </button>
      </div>
    </div>

    {/* Correct Matches */}
    <div>
      <label style={{ fontWeight: 'bold' }}>Correct Matches:</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {local.left_items.map((left, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ minWidth: 80 }}>{left || `Left ${i + 1}`}</span>
            <select
              value={local.correct_matches[left] || ''}
              onChange={e => handleMatchSelect(left, e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="">Select match</option>
              {local.right_items.map((r, j) => (
                <option key={j} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  </div>
)}


  {/* Buttons */}
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
    <button
      onClick={() => {
        onUpdate(local);
        setIsEditing(false); // выход из режима редактирования
      }}
      style={buttonStyle}
    >
      <FiSave size={14} />
      Save
    </button>
    <button
      onClick={onDelete}
      style={buttonStyle}
    >
      <FiTrash2 size={14} />
      Delete
    </button>
  </div>
</div>
);

  
}
return (
<div style={{
  backgroundColor: '#f9f9f9',
  padding: '12px 16px',
  marginBottom: 12,
  borderRadius: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}}>
  {/* Левая часть — текст вопроса и тип */}
  <div>
    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{local.question}</div>
    <div style={{ fontSize: 14, color: '#555' }}>Type: {local.type}</div>
  </div>

  {/* Правая часть — кнопки */}
  <div style={{ display: 'flex', gap: 8 }}>
    <button
      onClick={() => setIsEditing(true)}
      style={buttonStyle}
    >
      <FiPlus size={14} />
      Edit
    </button>
    <button
      onClick={onDelete}
      style={buttonStyle}
    >
      <FiTrash2 size={14} />
      Delete
    </button>
  </div>
</div>
);

}

EditorForQuestion.propTypes = {
  question: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};