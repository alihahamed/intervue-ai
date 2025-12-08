import { nodewhisper } from "nodejs-whisper";
import { pipeline } from "@huggingface/transformers";
import wavefile from "wavefile";
import fs from "fs";
import { spawn } from "child_process";

// This converts ANY audio (WebM, MP3, WAV) into the raw Float32 data the AI needs
function decodeAudio(filePath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      filePath, // Input file
      "-ar",
      "16000", // Sample rate: 16kHz (Required by Whisper)
      "-ac",
      "1", // Channels: 1 (Mono)
      "-c:a",
      "pcm_f32le", // Codec: PCM 32-bit Floating Point Little Endian
      "-f",
      "f32le", // Format: Raw 32-bit float
      "pipe:1", // Output: Stream to stdout
    ]);

    let buffers = [];

    // Collect the raw audio data coming from FFmpeg
    ffmpeg.stdout.on("data", (chunk) => {
      buffers.push(chunk);
    });

    // Handle errors
    ffmpeg.stderr.on("data", (data) => {
      // FFmpeg logs progress to stderr, so we don't reject on every message.
      // We only care if the process crashes.
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      } else {
        // Combine chunks into one buffer
        const rawBuffer = Buffer.concat(buffers);

        // Create a Float32Array view of the buffer
        // This is exactly what Transformers.js expects
        const float32Array = new Float32Array(
          rawBuffer.buffer,
          rawBuffer.byteOffset,
          rawBuffer.length / 4
        );

        resolve(float32Array);
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

export async function AudioResponse(filePath) {
  try {
    console.log("Listening to the audio file..");

    // const transcript = await nodewhisper(filePath, {
    //     modelName:'base'
    // });

    // console.log("transcript:", transcript)

    // const fullText = transcript
    //   .map((chunk) => chunk.speech)
    //   .join(" ")
    //   .trim();

    // let buffer = fs.readFileSync(filePath); // returns the contents of the file

    // let wav = new wavefile.WaveFile(buffer);
    // // Convert to the specific format the AI needs:
    // // - 32-bit Floating Point numbers
    // // - 16,000 Hz Sample Rate
    // wav.toBitDepth("32f");
    // wav.toSampleRate(16000);

    // let audioData = wav.getSamples();

    // if (Array.isArray(audioData)) {
    //   audioData = audioData[0];
    // }

    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en"
    );

    let audioData = decodeAudio(filePath)

    const fullText = await transcriber(audioData);

    console.log("The full text is:", fullText.text);

    return fullText.text.trim();
  } catch (error) {
    console.log("Error while listening to the audio file", error);
  }
}
