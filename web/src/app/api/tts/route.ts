import { NextResponse } from "next/server";

const MAX_CHARS = 4000;

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoice =
    process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const modelId =
    process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS not configured. Set ELEVENLABS_API_KEY." },
      { status: 503 }
    );
  }

  let body: { text?: string; voice_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text || "").slice(0, MAX_CHARS);
  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const voiceId = (body.voice_id || defaultVoice).trim();
  if (!/^[a-zA-Z0-9]{10,64}$/.test(voiceId)) {
    return NextResponse.json({ error: "invalid voice_id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText.slice(0, 300) || "ElevenLabs request failed" },
        { status: 502 }
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return NextResponse.json({
      audio_base64: buf.toString("base64"),
      format: "mp3",
    });
  } catch (e) {
    console.error("TTS route error", e);
    return NextResponse.json({ error: "TTS request failed" }, { status: 502 });
  }
}
