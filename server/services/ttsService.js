import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import wav from "wav";


async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

export async function TextToSpeech(text, filePath) {
  try {
    const ai = new GoogleGenAI({apiKey:process.env.GEMIN_KEY});

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        { parts: [{ text: "Say cheerfully: Have a wonderful day!" }] },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const audioBuffer = Buffer.from(data, "base64");

    const fileName = "out.wav";
    await saveWaveFile(fileName, audioBuffer);

    return audioBuffer

  } catch (error) {
    console.error("❌ TTS Error:", error);
    return null;
  }
}
