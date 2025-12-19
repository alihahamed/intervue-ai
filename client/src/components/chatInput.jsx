import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { useChat } from "../createContext";
import { useState } from "react";
import axios from "axios";
import { useReactMediaRecorder } from "react-media-recorder";
import { useEffect } from "react";

function ChatInput() {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const [inputText, setInputText] = useState("");
  const { message, addMessage, setSelectNiche, selectNiche, survey } =
    useChat();
  const [isUploading, setIsUploading] = useState(false);

  const handleAudioUpload = async (blobUrl) => {
    try {
      setIsUploading(true);
      const response = await fetch(blobUrl); // the mediaBlobUrl is internally updated whenever an audio is recorded. commenting here to prevent confusion
      const audioBlob = await response.blob();

      const history = message.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // console.log("Audio Size:", audioBlob.size);
      // if (audioBlob.size < 1000) {
      //     console.error("Audio file is too small/empty!");
      //     return;
      // }

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-audio.wav"); // 'audio' is the name being assigned so that the multer in the backend recoginzes it or else it would be rejected
      // audioBlob is the audio blob being sent and 'voice-audio.wav' is the name of the file thats being sent to prevent confusion
      // it will be renamed to 'audio-123456..' at the backend
      formData.append("niche", selectNiche);
      formData.append("history", JSON.stringify(history));
      const res = await axios.post(
        "http://localhost:3021/upload-audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("res", res);
      console.log("flag", res.data.success);
      if (res.data.success) {
        setInputText(res.data.userText);
      }

      console.log(inputText);
      console.log(res.data.userText);
    } catch (error) {
      console.error("upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      // blobPropertyBag: { type: "audio/wav" }, // forcing the audio type to be a wav file
      onStop: (blobUrl) => handleAudioUpload(blobUrl),
    });

  const voiceStatus = isUploading
    ? "processing"
    : status === "recording"
    ? "recording"
    : "idle";

  const handleVoiceSubmit = () => {
    if (status === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTextSubmit = async () => {
    console.log("selected niche", selectNiche);

    const history = message.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    addMessage("user", inputText);

    try {
      const response = await axios.post("http://localhost:3021/upload-text", {
        text: inputText,
        history: history,
        survey: survey,
      });

      console.log(response);
      console.log("options response", response.data.aiResponse.options);

      const triviaObject = response.data.aiResponse.options;

      const triviaOptions = triviaObject.map((triv) => triv);

      // addMessage("options", triviaOptions)

      // const result = console.log("This prints to the screen");
      // console.log("But the value of result is:", result);

      console.log("trivia options", triviaOptions);

      addMessage("assistant", response.data.aiResponse);
      console.log("message context data", message);

      

      const audio = new Audio("data:audio/mp3;base64," + response.data.audio);
      audio.play();
    } catch (error) {
      console.log("Upload-text error", error);
    }
  };
  
  useEffect(() => {
      const optionSender = message.map((msg, index) => // implicit return (without any curly braces or brackets)
        msg.sender === "chosenOption" ? msg.text : null 
      );

      console.log("option sender", optionSender);
      setInputText(optionSender)
  }, [message])

  

  return (
    <div>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onSubmit={handleTextSubmit}
        onChange={(e) => setInputText(e.target.value)}
        voiceState={voiceStatus}
        onVoiceClick={handleVoiceSubmit}
        value={inputText}
        setValue={setInputText}
      />
    </div>
  );
}

export default ChatInput;
