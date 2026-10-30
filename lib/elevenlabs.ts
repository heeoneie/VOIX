const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
// 외부 TTS가 응답하지 않을 때 요청이 무한정 걸려 있지 않게 한다
const TTS_TIMEOUT_MS = 15_000;

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
      signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  return response.arrayBuffer();
}
