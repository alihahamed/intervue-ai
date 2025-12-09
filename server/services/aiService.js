import fetch from 'node-fetch'

export async function getAiResponse(userTranscript, sysInstructions) {
  const systemPrompt = `You are a strict Senior Software Engineer conducting a job interview. 
        The candidate just gave an answer (provided in text). 
        
        1. Grade their answer from 1-10.
        2. Briefly explain why.
        
        
        Keep your response short but professional.`;

  try {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: sysInstructions },
          { role: "user", content: userTranscript },
        ],
        stream:false
      }),
    });

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.log("Error while fetching the ai response", error)
  }
}

