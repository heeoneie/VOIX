import { geminiModel } from "@/lib/gemini";
import { textToSpeech as elevenlabsTextToSpeech } from "@/lib/elevenlabs";
import { openaiGenerateText, openaiTextToSpeech, openaiTranscribe } from "@/lib/openai";

// STT·LLM은 AI_PROVIDER, TTS는 TTS_PROVIDER로 공급사를 고른다. 기본값은 기존 구성(Gemini + ElevenLabs)
const aiProvider = process.env.AI_PROVIDER === "openai" ? "openai" : "gemini";
const ttsProvider = process.env.TTS_PROVIDER === "openai" ? "openai" : "elevenlabs";

export async function transcribe(audio: Buffer, mimeType: string): Promise<string> {
  if (aiProvider === "openai") return openaiTranscribe(audio, mimeType);

  const result = await geminiModel.generateContent([
    { inlineData: { mimeType, data: audio.toString("base64") } },
    { text: "이 음성을 한국어 텍스트로 정확히 전사해주세요. 텍스트만 반환하세요." },
  ]);
  return result.response.text()?.trim() ?? "";
}

export async function generateText(prompt: string): Promise<string> {
  if (aiProvider === "openai") return openaiGenerateText(prompt);

  const result = await geminiModel.generateContent([{ text: prompt }]);
  return result.response.text()?.trim() ?? "";
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  if (ttsProvider === "openai") return openaiTextToSpeech(text);
  return elevenlabsTextToSpeech(text);
}
