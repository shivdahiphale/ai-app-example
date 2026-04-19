import api from "./api";

// Simple in-memory cache keyed by text+voice
const audioCache = new Map();
let currentAudio = null;

export async function speak(text, voice = "nova", onWordEnd) {
  const key = `${voice}::${text}`;
  try {
    // Stop anything playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    let src = audioCache.get(key);
    if (!src) {
      const res = await api.post("/tts", { text, voice });
      src = `data:audio/mp3;base64,${res.data.audio_base64}`;
      audioCache.set(key, src);
    }
    const audio = new Audio(src);
    currentAudio = audio;
    audio.onended = () => {
      if (onWordEnd) onWordEnd();
    };
    await audio.play();
    return audio;
  } catch (e) {
    console.error("TTS error", e);
    // Fallback to browser TTS if available
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.85;
      utter.pitch = 1.1;
      utter.onend = () => onWordEnd && onWordEnd();
      window.speechSynthesis.speak(utter);
    }
  }
}
