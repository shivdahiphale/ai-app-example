import { NextResponse } from "next/server";

/**
 * Tells the client whether server-side ElevenLabs TTS is configured.
 * No secrets are exposed; only a boolean.
 */
export function GET() {
  const serverTts = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  return NextResponse.json({ serverTts });
}
