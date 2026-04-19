"use client";

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

/** null = not checked yet, true = try /api/tts, false = use only browser TTS */
let serverTtsEnabledCache: boolean | null = null;

async function isServerTtsEnabled(): Promise<boolean> {
  if (serverTtsEnabledCache !== null) return serverTtsEnabledCache;
  try {
    const res = await fetch("/api/tts/available");
    if (!res.ok) {
      serverTtsEnabledCache = false;
      return false;
    }
    const data = (await res.json()) as { serverTts?: boolean };
    serverTtsEnabledCache = data.serverTts === true;
    return serverTtsEnabledCache;
  } catch (e) {
    console.error("TTS: could not check /api/tts/available, using browser speech", e);
    serverTtsEnabledCache = false;
    return false;
  }
}

function speakWithBrowser(
  text: string,
  onWordEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 1.1;
  utter.onend = () => onWordEnd?.();
  window.speechSynthesis.speak(utter);
}

/**
 * ElevenLabs is used only when ELEVENLABS_API_KEY is set on the server.
 * If not configured, uses browser speech without calling POST /api/tts.
 */
export async function speak(
  text: string,
  _voice?: string,
  onWordEnd?: () => void,
  voiceIdOverride?: string
): Promise<HTMLAudioElement | void> {
  const canUseServer = await isServerTtsEnabled();
  if (!canUseServer) {
    speakWithBrowser(text, onWordEnd);
    return;
  }

  const key = `${voiceIdOverride || "default"}::${text}`;
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    let src = audioCache.get(key);
    if (!src) {
      const body: { text: string; voice_id?: string } = { text };
      if (voiceIdOverride) body.voice_id = voiceIdOverride;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("TTS API error", { status: res.status, body: errBody });
        throw new Error("TTS request failed");
      }
      const data = (await res.json()) as { audio_base64: string; format: string };
      src = `data:audio/mp3;base64,${data.audio_base64}`;
      audioCache.set(key, src);
    }
    const audio = new Audio(src);
    currentAudio = audio;
    audio.onended = () => {
      onWordEnd?.();
    };
    await audio.play();
    return audio;
  } catch (e) {
    console.error("TTS error, falling back to browser speech", e);
    speakWithBrowser(text, onWordEnd);
  }
}
