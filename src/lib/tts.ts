"use client";

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

/**
 * ElevenLabs voice is chosen server-side (ELEVENLABS_VOICE_ID).
 * Optional client `voice` is ignored unless it looks like an ElevenLabs voice_id (20+ alnum chars).
 */
export async function speak(
  text: string,
  _voice?: string,
  onWordEnd?: () => void,
  voiceIdOverride?: string
): Promise<HTMLAudioElement | void> {
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
      if (!res.ok) throw new Error(await res.text());
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
    console.error("TTS error", e);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.85;
      utter.pitch = 1.1;
      utter.onend = () => onWordEnd?.();
      window.speechSynthesis.speak(utter);
    }
  }
}
