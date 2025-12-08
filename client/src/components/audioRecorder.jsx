import axios from "axios";
import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Loader2, Upload } from "lucide-react";

function AudioRecorder() {
  const [uploadStatus, setUploadStatus] = useState("");
  const [transcription, setTranscription] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");

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
      const res = await axios.post(
        "http://localhost:3021/upload-audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log('res', res)
      setTranscription(res.data.aiResponse);
      setAiFeedback(res.data.aiFeedback);

      console.log("transcription", transcription);
      console.log("ai feedback", aiFeedback);

      setUploadStatus("success");
    } catch (error) {
      console.error("upload failed:", error);
      setUploadStatus("error");
    }
  };

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
            <p className="text-gray-800 whitespace-pre-wrap">{aiFeedback}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default AudioRecorder;
