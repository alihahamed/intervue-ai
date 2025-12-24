import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { TaskType } from "@google/generative-ai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import dotenv from "dotenv";

dotenv.config();

// knowledge base

async function knowledge() {
  const urls = [
    {
      url: "https://raw.githubusercontent.com/greatfrontend/top-reactjs-interview-questions/main/README.md",
      topic: "react",
    },
    {
      url: "https://raw.githubusercontent.com/greatfrontend/top-javascript-interview-questions/main/README.md",
      topic: "javascript/nodejs",
    },
    {
      url: "https://raw.githubusercontent.com/Devinterview-io/python-interview-questions/main/README.md",
      topic: "python",
    },
  ];

  const client = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_API_KEY
  );
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT, // 'retrieval_document' because we tell the vector ai to store the document in the database. It organizes the vector to be findable
      apiKey: apiKey,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // 1000 chars per chunk
      chunkOverlap: 200,
      separators:["###", "\n\n", "\n", " "]
    });

    for (const data of urls) {
      const loader = new CheerioWebBaseLoader(data.url);
      const docs = await loader.load();
      // console.log("docs full data", docs[0]);
      // console.log("docs metadata", loadedDocs[0].metadata)
      const splitDocs = await splitter.splitDocuments(docs);
      // console.log("split docs", splitDocs);

      const cleanedDocs = splitDocs.filter(doc => {
        const content = doc.pageContent.toLowerCase();
      
      // If the chunk contains these phrases, it is JUNK.
      const isJunk = 
        content.includes("table of contents") ||
        content.includes("back to top") ||
        content.includes("disclaimer") ||
        content.includes("license") ||
        content.includes("click :star: if you like") ||
        content.includes("i recommend this") ||
        content.includes("practice") ||
        content.includes("you can also find") ||
        content.includes("| --- |") 
        content.includes("| no. | questions|") ||
        content.includes("explore all 100 answers") ||
        content.includes("100 Core Python Interview Questions in 2025")

        content.length < 50; // Skip tiny chunks (empty lines)

      // Keep it only if it is NOT junk
      return !isJunk;
      })

      const finalDocs = splitDocs.map((doc) => {
        doc.metadata.source = data.topic;
        return doc
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
    }
    console.log(
      "succesfully populated the database with the vector embeddings"
    );
  } catch (error) {
    console.log("knowledge base error", error);
  }
}

knowledge();
