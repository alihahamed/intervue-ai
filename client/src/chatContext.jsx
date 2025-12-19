import React, { createContext, useContext, useState } from "react";
import { Children } from "react";
import { ChatContext } from "./createContext";

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectNiche, setSelectNiche] = useState("Hooks");
  const [survey, setSurvey] = useState({
    userName: "Ali",
    experience: "No Experience",
    techStack: "React, Nodejs",
    targetRole: "Frontend Developer",
  });

  const addMessage = (sender, text, audioBase64 = null) => {
    setMessage((prev) => [
      ...prev,
      {
        sender,
        text,
        audio: audioBase64,
      },
    ]);
  };

  const handleOptionUpdate = (option) => {
    setMessage((prev) => {
      const lastMsg = prev[prev.length - 1];

      if (lastMsg && lastMsg.sender === "chosenOption") {
        const newHistory = prev.slice(0, -1);
        return [
          ...newHistory,
          { sender: "chosenOption", text: option, audio: null },
        ];
      }

      return [...prev, { sender: "chosenOption", text: option, audio: null }];
    });
  };

  return (
    <ChatContext.Provider
      value={{
        message,
        isProcessing,
        setIsProcessing,
        addMessage,
        selectNiche,
        setSelectNiche,
        survey,
        setSurvey,
        handleOptionUpdate
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
