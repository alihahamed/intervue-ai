import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

import {AudioResponse } from './services/audioService.js'
import {getAiResponse} from './services/aiService.js'
import { TextToSpeech } from './services/ttsService.js'

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

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  // upload.single('audio') looks for a file name with 'audio'
  if (!req.file) {
   return res.status(400).json({ message: "Error while recieving the file" });
  }

  const filePath = req.file.path; // the file path of the audio file

  try {
    const userText = await AudioResponse(filePath); // extracting the user's text from the audio (Audio -> Text)
    console.log("extracted text from audio", userText);

    if (!userText) { // error handling
      console.log("Maybe couldnt hear the audio and translate it to text");
      return res.json({
        message: "Error transcribing the audio to text",
        success: false,
      });
    }

    const aiResponse = await getAiResponse(userText); // getting the ai response to the user's reply (Text -> AI Response)
    console.log("Ai's response to the user", aiResponse);

    const audioBuffer = await TextToSpeech(aiResponse) // Raw buffer: 01001000 01100101 , Base64: UklGRi4AAABXQVZFZm10IBIA (Json friendly)
    const audioBase64 = audioBuffer ? audioBuffer.toString('base64') : null; // converting raw buffer to base64 to send it as a json response to the frontend which would play the audio.

    return res.json({
      userText: userText,
      aiResponse: aiResponse,
      audio:audioBase64
    });

  } catch (error) {
    console.log("error while sending data", error);
    return res.status(400).json({ message: error, success: false });
  }
});

app.listen(port, () => {
  console.log("Server started listening on port 3021");
});
