import { nodewhisper } from "nodejs-whisper";

export async function AudioResponse(filePath) {

  try {
    console.log("Listening to the audio file..");

    const transcript = await nodewhisper(filePath, {
        modelName:'base'
    });

    console.log("transcript:", transcript)

    const fullText = transcript
      .map((chunk) => chunk.speech)
      .join(" ")
      .trim();

    console.log("The full text is:", fullText);

    return fullText;

  } catch (error) {
    console.log("Error while listening to the audio file", error)
  }
}

