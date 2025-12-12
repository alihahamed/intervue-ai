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

const SYSTEM_PROMPT = {
  Hooks: `You are a Senior Frontend Architect conducting a high-stakes interview focusing on React Hooks.
        Your Process:
        Analyze the candidate's answer to your previous question.
        Grade it from 1-10. (Be strict. Look for mentions of 'referential equality', 'cleanup functions', and 'dependency arrays').
        Briefly explain the grade (what did they miss?).
        The Follow-up:
        If Grade is 7 or higher: Ask a harder question related to a different Hook or a complex performance scenario (e.g., useLayoutEffect vs useEffect, or custom hooks).
        If Grade is 6 or lower: Correct their mistake and ask a fundamental question to verify their basics.
        Format: Grade: [Number]/10 Feedback: [Short explanation] Next Question: [Your new question here]
        Keep your Response Short.`,
  SQL: `You are a Lead Database Administrator. You value efficiency, indexing, and scalability above all else. You are interviewing a candidate on SQL and Database Design.
          Your Process:
          Analyze the candidate's answer.
          Grade it from 1-10. (Fail them if they write inefficient queries or ignore ACID properties).
          Briefly explain why (mention 'Execution Plans', 'Indexing', or 'Normalization' where relevant).
          The Follow-up:
          If Grade is 7 or higher: Present a new scenario involving a slow query, a complex JOIN, or a database locking issue and ask them to solve it.
          If Grade is 6 or lower: Ask a simpler syntax or concept question (e.g., Left vs Inner Join).
          Format: Grade: [Number]/10 Feedback: [Short explanation] Next Question: [Your new question here]
          Keep your Response Short.`,
  Backend: `You are a Backend Systems Engineer. You are interviewing a candidate on Node.js Internals and Architecture.
            Your Process:
            Analyze the candidate's answer.
            Grade it from 1-10. (Be strict about the difference between the Call Stack, Event Loop, and Worker Threads).
            Briefly explain the grade.
            The Follow-up:
            If Grade is 7 or higher: Ask a new question about Streams, Buffers, Memory Leaks, or Clustering.
            If Grade is 6 or lower: Ask a foundational question about non-blocking I/O or the package.json file.
            Format: Grade: [Number]/10 Feedback: [Short explanation] Next Question: [Your new question here]
            Keep your Response Short.
            `,
};

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  // upload.single('audio') looks for a file name with 'audio'
  if (!req.file) {
    return res.status(400).json({ message: "Error while recieving the file" });
  }

  const filePath = req.file.path; // the file path of the audio file
  
  const selectedNiche = req.body.niche; // returns the selected niche from the frontend
  console.log("Selected niche:", selectedNiche);

  const systemInstructions = SYSTEM_PROMPT[selectedNiche];

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

    const __filename = fileURLToPath(import.meta.url);
    const ___dirname = dirname(__filename);
    

    const tempFileName = `response-${Date.now()}.mp3`;
    const tempFilePath = path.join(___dirname, "uploads", tempFileName);

    const aiResponse = await getAiResponse(userText, systemInstructions); // getting the ai response to the user's reply (Text -> AI Response)
    console.log("Ai's response to the user", aiResponse);

    const audioBuffer = await TextToSpeech(aiResponse); // Raw buffer: 01001000 01100101 , Base64: UklGRi4AAABXQVZFZm10IBIA (Json friendly)
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null; // converting raw buffer to base64 to send it as a json response to the frontend which would play the audio.

    fs.unlinkSync(filePath)

    return res.json({
      userText: userText,
      aiResponse: aiResponse,
      audio: audioBase64,
    });
  } catch (error) {
    console.log("error while sending data from upload-audio endpoint", error);
    return res.status(400).json({ message: error, success: false });
  }
});

app.post("/upload-text", async (req, res) => {
  const userText = req.body.text;
  const selectedNiche = req.body.niche;

  const systemInstructions = SYSTEM_PROMPT[selectedNiche];

  try {
    const aiResponse = await getAiResponse(userText, systemInstructions);
    console.log("Text endpoint ai response to the user:", aiResponse);

    const audioBuffer = await TextToSpeech(aiResponse);
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null;

    return res.json({
      userText: userText,
      aiResponse: aiResponse,
      audio: audioBase64,
    });
  } catch (error) {
    console.log("error while sending data from upload-text endpoint", error)
    return res.status(400)
  }
});

app.listen(port, () => {
  console.log("Server started listening on port 3021");
});
