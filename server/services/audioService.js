async function AudioResponse(filePath) {
  const whisper = require("whisper-node");

  try {
    console.log("Listening to the audio file..");

    const transcript = await whisper(filePath);

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

module.exports = {AudioResponse}