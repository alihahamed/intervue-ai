import { pipeline } from "@huggingface/transformers";
import wavefile from "wavefile";
import fs from "fs";

export async function TextToSpeech(text) {
  try {
    const synthesizer = await pipeline(
      "text-to-speech",
      "Xenova/speecht5_tts"
    //   {
    //     quantized: false,
    //   }
    );

    const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';


    const output = await synthesizer(text, { speaker_embeddings }); // output contains: { audio: Float32Array, sampling_rate: 16000 }

    const wav = new wavefile.WaveFile(); // convert raw numbers to wav format
    wav.fromScratch(1, output.sampling_rate, "32f", output.audio);
    fs.writeFileSync('output.wav', wav.toBuffer())

    return wav.toBuffer(); // convert to binary buffer

  } catch (error) {
    console.error("❌ TTS Error:", error);
    return null;
  }
}
