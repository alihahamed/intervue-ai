import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { AudioResponse } from "./services/audioService.js";
import { getAiResponse } from "./services/aiService.js";
import { TextToSpeech } from "./services/ttsService.js";
import { SysInstruction } from "./services/systemPrompt.js";
import { json } from "stream/consumers";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3021;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // the folder where the audio files are saved
  },
  filename: function (req, file, cb) {
    // We add Date.now() to the name to prevent files overwriting each other
    // e.g., "audio-123456789.wav"
    cb(null, "audio-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// audio upload endpoint

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  // upload.single('audio') looks for a file name with 'audio'
  if (!req.file) {
    return res.status(400).json({ message: "Error while recieving the file" });
  }

  const filePath = req.file.path; // the file path of the audio file
  // const surveyData = req.body.survey
  // console.log("survey data", surveyData)

  let history = [];

  try {
    history = JSON.parse(req.body.history || []);
  } catch (error) {
    console.log("Error converting string to array", error);
    history = [];
  }

  try {
    const userText = await AudioResponse(filePath); // extracting the user's text from the audio (Audio -> Text)
    console.log("extracted text from audio", userText);

    if (!userText) {
      // error handling
      console.log("Maybe couldnt hear the audio and translate it to text");
      return res.json({
        message: "Error transcribing the audio to text",
        success: false,
      });
    }

    return res.json({
      userText: userText,
      success: true,
    });
  } catch (error) {
    console.log("error while sending data from upload-audio endpoint", error);
    return res.status(400).json({ message: error, success: false });
  }
});

// text upload endpoint

app.post("/upload-text", async (req, res) => {
  const userText = req.body.text;
  const history = req.body.history; // THE CHAT HISTORY CONVERSTATION
  const surveyData = req.body.survey; // SURVEY DATA FROM THE MODAL

  console.log("survey data", surveyData);
  console.log(history);

  const systemInstructions = await SysInstruction(surveyData);
  console.log("system instructions", systemInstructions)

  try {
    const aiResponse = await getAiResponse(
      userText,
      systemInstructions,
      history
    );
    console.log("Text endpoint ai response to the user:", aiResponse);

    let aiData;

    try {
      aiData = JSON.parse(aiResponse);
      console.log("ai data:", aiData);
    } catch (error) {
      console.log("error parsing json to object");
      aiData = {
        grade: 0,
        feedback: "Couldnt completed the request",
        nextQuestion: "",
      };
    }

    const cleanText = `${aiData.feedback} ${aiData.nextQuestion}`;
    console.log("clean text", cleanText);

    const audioBuffer = await TextToSpeech(cleanText);
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null;

    return res.json({
      userText: userText,
      aiResponse: aiData,
      audio: audioBase64,
    });
  } catch (error) {
    console.log("error while sending data from upload-text endpoint", error);
    return res.status(400);
  }
});

app.listen(port, () => {
  console.log("Server started listening on port 3021");
});
