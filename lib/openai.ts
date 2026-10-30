const OPENAI_API_URL = "https://api.openai.com/v1";

export const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe";
export const OPENAI_LLM_MODEL = process.env.OPENAI_LLM_MODEL || "gpt-4o-mini";
export const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";

function authHeader() {
  return { Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` };
}

export async function openaiTranscribe(audio: Buffer, mimeType: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: mimeType }), "answer.webm");
  form.append("model", OPENAI_STT_MODEL);
  form.append("language", "ko");

  const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });
  if (!response.ok) {
    throw new Error(`OpenAI STT error: ${response.status}`);
  }
  const data = await response.json();
  return data.text?.trim() ?? "";
}

export async function openaiGenerateText(prompt: string): Promise<string> {
  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI LLM error: ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function openaiTextToSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice: "alloy",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`);
  }
  return response.arrayBuffer();
}
