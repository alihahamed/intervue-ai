import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { TaskType } from "@google/generative-ai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";

dotenv.config();

// knowledge base

async function knowledge() {
  const client = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_API_KEY
  );
  const apiKey = process.env.GOOGLE_API_KEY;

  const ai = new GoogleGenAI(apiKey);

  const TARGETS = [
    { role: "frontend", stack: "React", count: 10 },
    { role: "frontend", stack: "Vue", count: 10 },
    { role: "backend", stack: "Node.js", count: 10 },
    { role: "backend", stack: "Django", count: 10 },
    { role: "devops", stack: "Docker", count: 10 },
    { role: "ux", stack: "Figma", count: 10 },
  ];

  for (const target of TARGETS) {
    prompt = `
      Generate ${target.count} interview questions and answers for a ${target.role} developer specializing in ${target.stack}.
      
      Format the output strictly as a JSON Array of objects with this structure:
      [
        {
          "content": "Q: [Question here]\nA: [Detailed Answer here]",
          "topic": "[Specific concept, e.g. Event Loop]",
          "difficulty": "Junior" | "Mid" | "Senior"
        }
      ]
      Do not add markdown formatting like \`\`\`json. Just raw JSON.
      `;
  }

  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT, // 'retrieval_document' because we tell the vector ai to store the document in the database. It organizes the vector to be findable
      apiKey: apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    }); 

    

    // this function handles all the work to convert the text into the vector embeddings and store it into supabase (commenting so i dont get confused in the future)
    await SupabaseVectorStore.fromDocuments(
      cleanedDocs,
      embeddings, // The Worker (The Google tool that turns Words -> Numbers)
      {
        client, // supabase database
        tableName: "documents", // database name
      }
    );

    
    console.log(
      "succesfully populated the database with the vector embeddings"
    );
  } catch (error) {
    console.log("knowledge base error", error);
  }
}

knowledge();
