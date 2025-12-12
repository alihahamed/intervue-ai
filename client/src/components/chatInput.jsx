import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { useChat } from "../createContext";
import { useState } from "react";
import axios from "axios";

function ChatInput() {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const [inputText, setInputText] = useState("");
  const { addMessage, setSelectNiche, selectNiche } = useChat();

  const handleTextSubmit = async () => {
    

    console.log("selected niche", selectNiche);

    try {
      const response = await axios.post("http://localhost:3021/upload-text", {
        text: inputText,
        niche: selectNiche,
      });

      console.log(response);
      addMessage("user", response.data.userText);
      addMessage("assistant", response.data.aiResponse);

      const audio = new Audio("data:audio/mp3;base64," + response.data.audio);
      audio.play();

    } catch (error) {
      console.log("Upload-text error", error);
    }
  };

  return (
    <div>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onSubmit={handleTextSubmit}
        onChange={(e) => setInputText(e.target.value)}
      />
    </div>
  );
}

export default ChatInput;
