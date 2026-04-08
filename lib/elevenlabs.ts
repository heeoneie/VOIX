const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

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
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  return response.arrayBuffer();
}
