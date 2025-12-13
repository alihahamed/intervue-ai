import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { useChat } from "../createContext";
import { useState } from "react";
import axios from "axios";
import { useReactMediaRecorder } from "react-media-recorder";

function ChatInput() {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const [inputText, setInputText] = useState("");
  const { message ,addMessage, setSelectNiche, selectNiche } = useChat();
  const [isUploading, setIsUploading] = useState(false)

  const handleAudioUpload = async (blobUrl) => {
    try {
      setIsUploading(true)
      const response = await fetch(mediaBlobUrl); // the mediaBlobUrl is internally updated whenever an audio is recorded. commenting here to prevent confusion
      const audioBlob = await response.blob();

      const history = message.map(msg => ({
      role:msg.sender === "user" ? "user" : "assistant",
      content:msg.text
    }))

    console.log("Audio Size:", audioBlob.size); 
    if (audioBlob.size < 1000) {
        console.error("Audio file is too small/empty!");
        return;
    }

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-audio.wav"); // 'audio' is the name being assigned so that the multer in the backend recoginzes it or else it would be rejected
      // audioBlob is the audio blob being sent and 'voice-audio.wav' is the name of the file thats being sent to prevent confusion
      // it will be renamed to 'audio-123456..' at the backend
      formData.append("niche", selectNiche);
      formData.append("history", JSON.stringify(history))
      const res = await axios.post(
        "http://localhost:3021/upload-audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("res", res);

      addMessage('user', res.data.userText) // adding 'user' message to the context
      addMessage('assistant', res.data.aiResponse) // adding 'ai' response to the context
      // console.log("base64 string", res.data.audio) // a long ass paragraph of strings

      const audio = new Audio("data:audio/mp3;base64," + res.data.audio);
      audio.play();
      
    } catch (error) {
      console.error("upload failed:", error); 
    } finally {
      setIsUploading(false)
    }
  }

const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      // blobPropertyBag: { type: "audio/wav" }, // forcing the audio type to be a wav file
      onStop:(blobUrl) => handleAudioUpload(blobUrl) 
    });

const voiceStatus = isUploading ? "processing" : status === "recording" ? "recording" : "idle"

const handleVoiceSubmit = () => {
    if(status === 'recording') {
        stopRecording()
        
    } else {
        startRecording()
    }
}

  const handleTextSubmit = async () => {

    console.log("selected niche", selectNiche);
    
    const history = message.map(msg => ({
      role:msg.sender === "user" ? "user" : "assistant",
      content:msg.text
    }))

    console.log("history", history)

    try {
      const response = await axios.post("http://localhost:3021/upload-text", {
        text: inputText,
        niche: selectNiche,
        history:history
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
        voiceState={voiceStatus}
        onVoiceClick={handleVoiceSubmit}
        
      />
    </div>
  );
}

export default ChatInput;
