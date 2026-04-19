import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { speak } from "../lib/tts";
import { ComicCard } from "../components/ui/ComicCard";
import { ComicButton } from "../components/ui/ComicButton";
import { Volume2, Star } from "lucide-react";

export default function WordsTab({ onProgress, learned = [] }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/words").then((r) => {
      setWords(r.data);
      setLoading(false);
    });
  }, []);

  const playWord = async (w) => {
    await speak(w.word, "nova");
    try {
      if (!learned.includes(w.id)) {
        await api.post("/progress", { type: "word", item_id: w.id });
        onProgress && onProgress();
      }
    } catch (e) {}
  };

  const playWithMeaning = async (w) => {
    await speak(`${w.word}. ${w.meaning}.`, "nova");
  };

  if (loading) {
    return <div className="text-center font-hero text-3xl py-20">LOADING WORDS...</div>;
  }

  return (
    <div data-testid="words-tab">
      <div className="mb-6">
        <h2 className="font-hero text-4xl md:text-5xl tracking-wide text-hero-ink mb-2">
          WORD ARSENAL
        </h2>
        <p className="font-body text-lg font-bold text-slate-700">
          Tap a word to hear it. Tap the button to learn its meaning!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {words.map((w) => {
          const done = learned.includes(w.id);
          return (
            <ComicCard
              key={w.id}
              className="relative hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0F172A] transition-all"
              data-testid={`word-card-${w.word}`}
            >
              {done && (
                <div className="absolute top-3 right-3 z-10 bg-hero-yellow border-[3px] border-hero-ink rounded-full p-1.5">
                  <Star className="w-4 h-4 text-hero-ink fill-hero-ink" strokeWidth={3} />
                </div>
              )}
              <button
                onClick={() => playWord(w)}
                className="w-full p-6 text-left bg-gradient-to-br from-white to-hero-cream border-b-[4px] border-hero-ink hover:bg-hero-cream transition-all"
              >
                <div className="text-7xl mb-2">{w.emoji}</div>
                <div className="font-hero text-5xl tracking-wide text-hero-red">{w.word}</div>
                {w.category && (
                  <div className="inline-block mt-2 px-3 py-0.5 bg-hero-blue text-white font-body text-xs font-black uppercase rounded-full border-[2px] border-hero-ink">
                    {w.category}
                  </div>
                )}
              </button>
              <div className="p-4 bg-white">
                <p className="font-body text-base font-bold text-slate-800 min-h-[48px]">
                  {w.meaning}
                </p>
                <div className="flex gap-2 mt-3">
                  <ComicButton
                    onClick={() => playWord(w)}
                    variant="accent"
                    size="sm"
                    className="flex items-center gap-1.5 flex-1"
                    data-testid={`speak-word-${w.word}`}
                  >
                    <Volume2 className="w-4 h-4" strokeWidth={3} /> SAY IT
                  </ComicButton>
                  <ComicButton
                    onClick={() => playWithMeaning(w)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    LEARN
                  </ComicButton>
                </div>
              </div>
            </ComicCard>
          );
        })}
      </div>
    </div>
  );
}
