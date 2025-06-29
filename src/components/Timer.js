import React from "react";
import { useEffect, useState } from "react";

export default function Timer({ duration, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "18px", color: "#010528" }}>
      ⏱ Time left: {formatTime(secondsLeft)}
    </div>
  );
}
