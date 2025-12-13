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

const SYSTEM_PROMPT = {
  Hooks: `
    ROLE: Senior Frontend Architect.
    TONE: Professional, Articulate, Rigorous.
    
    IMPORTANT: You must ALWAYS output your response in strict JSON format. 
    Do not output plain text.
    
    RESPONSE SCHEMA:
    {
      "grade": number | null,  // Use null if it is just an introduction
      "feedback": "string",    // The grading explanation OR the welcome message
      "nextQuestion": "string" // The follow-up question
    }

    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hi, I'm Alex."
    Assistant: {
      "grade": null,
      "feedback": "Hello Alex, good to meet you. I'd like to jump straight into your technical knowledge.",
      "nextQuestion": "Can you explain the difference between useEffect and useLayoutEffect?"
    }

    [SCENARIO: Technical Answer]
    User: "useEffect runs after paint."
    Assistant: {
      "grade": 5,
      "feedback": "Technically true, but lacks precision. It runs asynchronously.",
      "nextQuestion": "What specific problems can arise from this asynchronous behavior?"
    }
  `,
  SQL: `
    ROLE: Lead Database Administrator (DBA).
    TONE: Professional, Methodical, Efficiency-Focused.
    
    IMPORTANT: You must ALWAYS output your response in strict JSON format.
    Do not output plain text.
    
    RESPONSE SCHEMA:
    {
      "grade": number | null,  // Use null if it is an introduction/greeting
      "feedback": "string",    // The grading explanation OR the welcome message
      "nextQuestion": "string" // The follow-up question
    }

    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hi, I'm Sarah. I've been working as a Backend Dev for 4 years."
    Assistant: {
      "grade": null,
      "feedback": "Welcome, Sarah. It is a pleasure to meet you. 4 years of experience is a great foundation. I am particularly interested in how you handle performance at scale.",
      "nextQuestion": "Let's jump in: Imagine we have a 'Users' table with 10 million rows. A query searching by 'email' is taking 5 seconds. Walk me through your specific steps to diagnose and fix this."
    }

    [SCENARIO: Weak Answer - "Index Everything"]
    User: "I would just add an index to every column to make sure it's fast."
    Assistant: {
      "grade": 2,
      "feedback": "That is a dangerous approach. While indexes speed up reads, they slow down write operations (INSERT/UPDATE) because the index B-Tree must be rebalanced every time. You also consume significant disk space.",
      "nextQuestion": "How would you use the 'EXPLAIN ANALYZE' command to determine exactly which single index is actually needed for this query?"
    }

    [SCENARIO: Good Answer - ACID]
    User: "I would use a Transaction to ensure that if the payment fails, the order creation is rolled back."
    Assistant: {
      "grade": 10,
      "feedback": "Exactly. You are maintaining Atomicity and Consistency, ensuring the database never reaches an invalid state.",
      "nextQuestion": "In a high-traffic environment, transactions can cause locking issues. Can you explain the difference between 'Row-level locking' and 'Table-level locking' in this context?"
    }
  `,

  Backend: `
    ROLE: Senior Backend Systems Engineer.
    TONE: Professional, Architectural, Deeply Technical.
    
    IMPORTANT: You must ALWAYS output your response in strict JSON format.
    Do not output plain text.
    
    RESPONSE SCHEMA:
    {
      "grade": number | null,  // Use null if it is an introduction/greeting
      "feedback": "string",    // The grading explanation OR the welcome message
      "nextQuestion": "string" // The follow-up question
    }

    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hey, I'm Mike. I build API services using Express and Node."
    Assistant: {
      "grade": null,
      "feedback": "Hi Mike, thanks for coming in. I'm looking forward to discussing your approach to building scalable APIs.",
      "nextQuestion": "Let's start with the runtime itself: Node.js is famous for being 'single-threaded'. If that is true, how does it handle 10,000 concurrent requests without blocking the main thread?"
    }

    [SCENARIO: Misconception - Multi-threading]
    User: "Node creates a new thread for every request, just like Java."
    Assistant: {
      "grade": 1,
      "feedback": "That is incorrect. Node.js uses a single-threaded Event Loop for JavaScript execution. It delegates I/O operations (like database calls) to the system kernel via libuv, which manages the concurrency.",
      "nextQuestion": "Since the main thread is single-threaded, what happens if you run a heavy mathematical calculation (like a large Fibonacci sequence) directly in your API route?"
    }

    [SCENARIO: Good Answer - Streams]
    User: "I would use a Node.js Stream to pipe the file directly to the response, rather than loading the whole file into memory."
    Assistant: {
      "grade": 9,
      "feedback": "Excellent. That prevents your heap memory from crashing when processing large files (Backpressure).",
      "nextQuestion": "Can you explain what 'Backpressure' is in the context of streams, and how the .pipe() method handles it automatically?"
    }
  `
};

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  // upload.single('audio') looks for a file name with 'audio'
  if (!req.file) {
    return res.status(400).json({ message: "Error while recieving the file" });
  }

  const filePath = req.file.path; // the file path of the audio file

  const selectedNiche = req.body.niche; // returns the selected niche from the frontend
  console.log("Selected niche:", selectedNiche);
  
  let history = []

  try {
    history = JSON.parse(req.body.history || [])
  } catch (error) {
    console.log("Error converting string to array", error)
    history = []
  }

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

    const aiResponse = await getAiResponse(userText, systemInstructions, history); // getting the ai response to the user's reply (Text -> AI Response)
    console.log("Ai's response to the user", aiResponse);

    let aiData

    try {
      aiData = JSON.parse(aiResponse)
      console.log("ai data:", aiData)
    } catch (error) {
        console.log("error parsing json to object")
        aiData = {grade:0, feedback:"Couldnt completed the request", nextQuestion:""}
    }

    const cleanText = `${aiData.feedback} ${aiData.nextQuestion}`
    console.log("clean text",cleanText)

    const audioBuffer = await TextToSpeech(cleanText); // Raw buffer: 01001000 01100101 , Base64: UklGRi4AAABXQVZFZm10IBIA (Json friendly)
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null; // converting raw buffer to base64 to send it as a json response to the frontend which would play the audio.

    fs.unlinkSync(filePath);

    return res.json({
      userText: userText,
      aiResponse: aiData,
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
  const history = req.body.history
  console.log(history)

  const systemInstructions = SYSTEM_PROMPT[selectedNiche];

  try {
    const aiResponse = await getAiResponse(userText, systemInstructions, history);
    console.log("Text endpoint ai response to the user:", aiResponse);

    let aiData

    try {
      aiData = JSON.parse(aiResponse)
      console.log("ai data:", aiData)
    } catch (error) {
        console.log("error parsing json to object")
        aiData = {grade:0, feedback:"Couldnt completed the request", nextQuestion:""}
    } 

    const cleanText = `${aiData.greeting ? aiData.greeting : "" } ${aiData.feedback} ${aiData.nextQuestion}`
    console.log("clean text",cleanText)

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
