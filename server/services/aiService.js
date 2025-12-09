import fetch from 'node-fetch'
import Groq from 'groq-sdk/index.mjs';

export async function getAiResponse(userTranscript, sysInstructions) {
  
  const groq = new Groq({apiKey:"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"})

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: sysInstructions},
        { role: "user", content: userTranscript },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.5, 
    });

   return completion.choices[0]?.message?.content || "No response generated.";
   
  } catch (error) {
    console.log("Error while fetching the ai response", error)
  }
}

