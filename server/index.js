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
import { VoiceSysInstruction } from "./services/voiceInstructions.js";
import { json } from "stream/consumers";

import { createClient } from "@deepgram/sdk";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3021;

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.get("/api/get-agent-token", async (req, res) => {
  const url = "https://api.deepgram.com/v1/auth/grant";
  const options = {
    method: "POST",
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, "Content-Type": "application/json" },
    body: {
      ttl_seconds:300
    },
  };

  try {
    const response = await fetch(url, options)
    const data = await response.json();
    console.log("key data", data);

    return res.json({
      key: data.access_token,
    });
  } catch (error) {
    console.log("error generating access token", error);
    res.status(500).json({
      error: "failed to provide interview context",
    });
  }
});

app.post("/api/get-voice-context", async (req, res) => {
  const survey = req.body.surveyData;

  try {
    const instructions = await VoiceSysInstruction(survey);
    console.log("voice context data", instructions);
    return res.json({
      instructions,
    });
  } catch (error) {}
});

app.listen(port, () => {
  console.log("Server started listening on port 3021");
});
