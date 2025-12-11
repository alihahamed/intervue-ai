import axios from "axios";
import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Loader2, Upload } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import { useChat } from "../chatContext";

function AudioRecorder() {
  const [uploadStatus, setUploadStatus] = useState("");
  const [transcription, setTranscription] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [streamResponse, setStreamResponse] = useState([]);

  const {addMessage, setIsProcessing} = useChat() // extracting from the context provider

  const [selectNiche, setSelectNiche] = useState("Hooks");

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: { type: "audio/wav" }, // forcing the audio type to be a wav file
    });

  const handleUpload = async () => {
    if (!mediaBlobUrl) return;

    setUploadStatus("uploading");

    try {
      const response = await fetch(mediaBlobUrl); // the mediaBlobUrl is internally updated whenever an audio is recorded. commenting here to prevent confusion
      const audioBlob = await response.blob();

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-audio.wav"); // 'audio' is the name being assigned so that the multer in the backend recoginzes it or else it would be rejected
      // audioBlob is the audio blob being sent and 'voice-audio.wav' is the name of the file thats being sent to prevent confusion
      // it will be renamed to 'audio-123456..' at the backend
      formData.append("niche", selectNiche);
      const res = await axios.post(
        "http://localhost:3021/upload-audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("res", res);
      
      addMessage('user', res.data.userText) // adding 'user' message to the context
      addMessage('user', res.data.aiResponse) // adding 'ai' response to the context

      setTranscription(res.data.userText)
      setAiFeedback(res.data.aiResponse);
      console.log("feedback", aiFeedback);

      const splitResponse = aiFeedback.split(" "); // streaming the response work that "type writier effect" to work
      console.log(splitResponse);

      const stream = splitResponse.map((word) => ({ text: word + "\u00A0", className: "text-blue-500 text-sm" }));
      setStreamResponse(stream);
      console.log(streamResponse);

      // console.log("base64 string", res.data.audio) // a long ass paragraph of strings

      const audio = new Audio("data:audio/mp3;base64," + res.data.audio);
      audio.play();
      setUploadStatus("success");
    } catch (error) {
      console.error("upload failed:", error);
      setUploadStatus("error");
    }
  };

  // const handleNiche = async () => {

  //   try {
  //     const response = await axios.post("http://localhost:3021/sys-instructions", sysInstructions,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     )
  //     console.log(response)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // };

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-lg bg-white max-w-sm mx-auto mt-10">
        <h2 className="text-xl font-bold">🎙️ Interview Recorder</h2>

        <div
          className={`text-sm font-medium ${
            status === "recording"
              ? "text-red-600 animate-pulse"
              : "text-green-600"
          }`}
        >
          Status:{status}
        </div>

        <div>
          <button
            className="p-2 bg-blue-700 rounded-full hover:bg-blue-600"
            onClick={() => setSelectNiche("Hooks")}
          >
            Hooks{" "}
          </button>
          <button
            className="p-2 bg-green-700 rounded-full hover:bg-green-600"
            onClick={() => setSelectNiche("SQL")}
          >
            SQL queries
          </button>
          <button
            className="p-2 bg-orange-400 rounded-full hover:bg-orange-300"
            onClick={() => setSelectNiche("Backend")}
          >
            Backend
          </button>
        </div>

        <div>
          <button
            onClick={startRecording}
            disabled={status === "recording"}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            Record
          </button>
          <button
            onClick={stopRecording}
            disabled={status !== "recording"}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            Stop Recording
          </button>
        </div>

        {mediaBlobUrl && (
          <audio src={mediaBlobUrl} controls className="mt-4 w-full" />
        )}

        {mediaBlobUrl && status === "stopped" && (
          <button
            onClick={handleUpload}
            disabled={uploadStatus === "uploading"}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {uploadStatus === "uploading" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploadStatus === "uploading" ? "Sending..." : "Submit Answer"}
          </button>
        )}

        {uploadStatus === "success" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full">
            <p className="text-xs font-bold text-gray-500 uppercase">
              You said:
            </p>
            <p className="mb-4 italic">"{transcription}"</p>

            <p className="text-xs font-bold text-blue-500 uppercase">
              AI Coach:
            </p>
            <h3 className="text-gray-800 whitespace-pre-wrap text-sm">
              <TypewriterEffectSmooth words={streamResponse} />
            </h3>
          </div>
        )}
      </div>
    </>
  );
}

export default AudioRecorder;
