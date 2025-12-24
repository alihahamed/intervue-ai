import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js/dist/index.cjs";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { TaskType } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// knowledge base

const interviewData = [
  {
    text: "React useEffect runs after every render. To run it only on mount, pass an empty dependency array [].",
    meta: { topic: "React", difficulty: "Junior" },
  },
  {
    text: "In Node.js, the Event Loop allows non-blocking I/O operations despite JavaScript being single-threaded.",
    meta: { topic: "Node", difficulty: "Senior" },
  },
  {
    text: "Closures in JavaScript are functions that have access to the outer function's variable scope.",
    meta: { topic: "JavaScript", difficulty: "Mid" },
  },
];

async function knowledge() {
  const client = createClient(
    process.env.SUPABASE_API_KEY,
    process.env.SUPABASE_PROJECT_ID
  );
  const apiKey = process.env.GOOGLE_API_KEY;

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-005",
    taskType: TaskType.RETRIEVAL_DOCUMENT, // 'retrieval_document' because we tell the vector ai to store the document in the database. It organizes the vector to be findable
    apiKey: apiKey,
  });

  const texts = interviewData.map((t) => t.text);
  const metadatas = interviewData.map((m) => m.meta);
  console.log("text", text);
  console.log("meta", metaData);


  // this function handles all the work to convert the text into the vector embeddings and store it into supabase (commenting so i dont get confused in the future)
  await SupabaseVectorStore.fromTexts( // Creates a new SupabaseVectorStore instance from an array of texts. 
    texts, // the raw english words
    metadatas, // the tags like topic and difficulty
    embeddings, // The Worker (The Google tool that turns Words -> Numbers)
    {
      client, // supabase database 
      tableName: "documents", // database name
    }
  );

  console.log("succesfully populated the database with the vector embeddings")
}

knowledge();
