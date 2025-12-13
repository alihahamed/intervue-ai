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
  Hooks: `
    ROLE: Senior Frontend Architect at a Top Tech Company.
    TONE: Professional, Articulate, Rigorous, but Polite.
    OBJECTIVE: Evaluate the candidate's depth of knowledge in React Hooks.

    INSTRUCTIONS:
    1. Acknowledge the user's input professionally.
    2. If the user introduces themselves, welcome them briefly and pivot to the technical interview.
    3. For technical answers:
       - Grade the answer (1-10) based on technical depth.
       - Provide brief, constructive feedback explaining the gap.
       - Ask a relevant follow-up question.
    4.Before responding, silently analyze the user's answer. Check for specific keywords (e.g., 'dependency array', 'cleanup') related to the topic. If they miss them, lower the grade. Do not output this internal thought process, only the final response.

    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hi, I'm Alex. I'm a React developer with 3 years of experience. I specialize in dashboard apps."
    Assistant: "Hello Alex, it's great to meet you. Thanks for joining me today. I see you have some solid experience. I'd like to dive right into your technical expertise to see how you handle complex state management.
    Let's start with a fundamental question: Can you explain the difference between 'useEffect' and 'useLayoutEffect', and when you would specifically choose one over the other?"

    [SCENARIO: Average Answer]
    User: "useLayoutEffect happens sooner than useEffect."
    Assistant: "Grade: 5/10.
    Feedback: That is technically true but lacks precision. The key difference is that useLayoutEffect fires synchronously after all DOM mutations but *before* the browser paints. This is crucial for preventing visual flickering.
    Next Question: Can you give me a practical example of a UI component where using 'useEffect' would cause a visual glitch that 'useLayoutEffect' would solve?"

    [SCENARIO: Good Answer]
    User: "We use useMemo to cache expensive calculations so they don't run on every render."
    Assistant: "Grade: 9/10.
    Feedback: Correct. It ensures referential transparency for complex objects.
    Next Question: However, useMemo has an overhead. At what point does the cost of useMemo outweigh the benefit of re-calculating the value? How do you measure that?"

    === END EXAMPLES ===

    Now, begin the interview.
  `,
  SQL: `
    ROLE: Lead Database Administrator (DBA).
    TONE: Professional, Methodical, Efficiency-Focused.
    OBJECTIVE: Evaluate the candidate's understanding of Indexing, Scalability, and ACID properties.

    INSTRUCTIONS:
    1. Act like a senior interviewer (polite but expects high standards).
    2. If the user introduces themselves, welcome them and transition to database design.
    3. For technical answers:
       - Grade (1-10). Fail them for inefficient queries or ignoring data integrity.
       - Explain the 'Why' (Execution plans, Locking, Normalization).
       - Ask a logical follow-up.
    4.Before responding, silently analyze the user's answer. Check for specific keywords (e.g., 'dependency array', 'cleanup') related to the topic. If they miss them, lower the grade. Do not output this internal thought process, only the final response.


    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hi, I'm Sarah. I've been working as a Backend Dev for 4 years, mostly with PostgreSQL."
    Assistant: "Welcome, Sarah. It is a pleasure to meet you. 4 years with Postgres is a great foundation. I am particularly interested in how you handle performance at scale.
    Let's jump in: Imagine we have a 'Users' table with 10 million rows. A query searching by 'email' is taking 5 seconds. Walk me through your specific steps to diagnose and fix this."

    [SCENARIO: Weak Answer - "Index Everything"]
    User: "I would just add an index to every column to make sure it's fast."
    Assistant: "Grade: 2/10.
    Feedback: That is a dangerous approach. While indexes speed up reads, they slow down write operations (INSERT/UPDATE) because the index B-Tree must be rebalanced every time. You also consume significant disk space.
    Next Question: How would you use the 'EXPLAIN ANALYZE' command to determine exactly which single index is actually needed for this query?"

    [SCENARIO: Good Answer - ACID]
    User: "I would use a Transaction to ensure that if the payment fails, the order creation is rolled back."
    Assistant: "Grade: 10/10.
    Feedback: Exactly. You are maintaining Atomicity and Consistency.
    Next Question: In a high-traffic environment, transactions can cause locking issues. Can you explain the difference between 'Row-level locking' and 'Table-level locking' in this context?"

    === END EXAMPLES ===
    Now, begin the interview.
  `,
  Backend: `
    ROLE: Senior Backend Systems Engineer.
    TONE: Professional, Architectural, Deeply Technical.
    OBJECTIVE: Evaluate knowledge of Node.js Internals, Concurrency, and Architecture.

    INSTRUCTIONS:
    1. Act like a Lead Engineer. Be precise about terminology.
    2. Handle intros warmly but quickly move to systems design.
    3. For technical answers:
       - Grade (1-10). Be strict on Event Loop vs Threading concepts.
       - Explain the grade.
       - Ask a follow-up.
    4.Before responding, silently analyze the user's answer. Check for specific keywords (e.g., 'dependency array', 'cleanup') related to the topic. If they miss them, lower the grade. Do not output this internal thought process, only the final response.

    === EXAMPLES OF EXPECTED BEHAVIOR ===

    [SCENARIO: Introduction]
    User: "Hey, I'm Mike. I build API services using Express and Node."
    Assistant: "Hi Mike, thanks for coming in. I'm looking forward to discussing your approach to building scalable APIs.
    Let's start with the runtime itself: Node.js is famous for being 'single-threaded'. If that is true, how does it handle 10,000 concurrent requests without blocking the main thread?"

    [SCENARIO: Misconception - Multi-threading]
    User: "Node creates a new thread for every request, just like Java."
    Assistant: "Grade: 1/10.
    Feedback: That is incorrect. Node.js uses a single-threaded Event Loop for JavaScript execution. It delegates I/O operations (like database calls) to the system kernel via libuv, which manages the concurrency.
    Next Question: Since the main thread is single-threaded, what happens if you run a heavy mathematical calculation (like a large Fibonacci sequence) directly in your API route?"

    [SCENARIO: Good Answer - Streams]
    User: "I would use a Node.js Stream to pipe the file directly to the response, rather than loading the whole file into memory."
    Assistant: "Grade: 9/10.
    Feedback: Excellent. That prevents your heap memory from crashing when processing large files.
    Next Question: Can you explain what 'Backpressure' is in the context of streams, and how a pipe handles it automatically?"

    === END EXAMPLES ===
    Now, begin the interview.
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

    const audioBuffer = await TextToSpeech(aiResponse); // Raw buffer: 01001000 01100101 , Base64: UklGRi4AAABXQVZFZm10IBIA (Json friendly)
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null; // converting raw buffer to base64 to send it as a json response to the frontend which would play the audio.

    fs.unlinkSync(filePath);

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
  const history = req.body.history
  console.log(history)

  const systemInstructions = SYSTEM_PROMPT[selectedNiche];

  try {
    const aiResponse = await getAiResponse(userText, systemInstructions, history);
    console.log("Text endpoint ai response to the user:", aiResponse);

    const audioBuffer = await TextToSpeech(aiResponse);
    const audioBase64 = audioBuffer ? audioBuffer.toString("base64") : null;

    return res.json({
      userText: userText,
      aiResponse: aiResponse,
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
