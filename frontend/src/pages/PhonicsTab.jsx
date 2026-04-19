import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { speak } from "../lib/tts";
import { ComicCard } from "../components/ui/ComicCard";
import { ComicButton } from "../components/ui/ComicButton";
import { PowBurst } from "../components/PowBurst";
import { Volume2, Star } from "lucide-react";

export default function PhonicsTab({ onProgress, learned = [] }) {
  const [phonics, setPhonics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showPow, setShowPow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/phonics").then((r) => {
      setPhonics(r.data);
      setLoading(false);
    });
  }, []);

  const playPhonic = async (p) => {
    setSelected(p.id);
    // Sound + letter + example word spoken by TTS
    const text = `${p.letter}. ${p.sound}. ${p.example_word}.`;
    await speak(text, "nova", () => {
      setShowPow(true);
      setTimeout(() => setShowPow(false), 800);
    });
    try {
      if (!learned.includes(p.id)) {
        await api.post("/progress", { type: "phonic", item_id: p.id });
        onProgress && onProgress();
      }
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return <div className="text-center font-hero text-3xl py-20">LOADING HEROES...</div>;
  }

  return (
    <div data-testid="phonics-tab">
      <PowBurst show={showPow} text="BOOM!" />

      <div className="mb-6">
        <h2 className="font-hero text-4xl md:text-5xl tracking-wide text-hero-ink mb-2">
          PHONIC POWERS
        </h2>
        <p className="font-body text-lg font-bold text-slate-700">
          Tap a letter to learn its sound! Each letter has its own super hero.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
        {phonics.map((p) => {
          const done = learned.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => playPhonic(p)}
              data-testid={`phonic-${p.letter}`}
              className={`relative aspect-square flex flex-col items-center justify-center bg-white rounded-2xl border-[4px] border-hero-ink shadow-comic-sm hover:-translate-y-1 hover:shadow-comic transition-all active:translate-y-0 active:shadow-comic-xs ${
                selected === p.id ? "animate-wobble" : ""
              }`}
              style={{ background: done ? "#FFF4D2" : "white" }}
            >
              {done && (
                <Star
                  className="absolute top-1 right-1 w-5 h-5 text-hero-yellow fill-hero-yellow"
                  strokeWidth={3}
                />
              )}
              <div
                className="font-hero text-5xl md:text-6xl"
                style={{ color: p.color }}
              >
                {p.letter}
              </div>
              <div className="font-body text-[10px] md:text-xs font-black text-slate-600 uppercase tracking-wider mt-1 px-1 text-center leading-tight">
                {p.hero_name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail card of last clicked */}
      {selected && (
        <div className="mt-8">
          {phonics
            .filter((p) => p.id === selected)
            .map((p) => (
              <ComicCard key={p.id} className="max-w-xl mx-auto" data-testid="phonic-detail">
                <div
                  className="p-6 border-b-[4px] border-hero-ink flex items-center gap-5"
                  style={{ backgroundColor: p.color + "22" }}
                >
                  <div
                    className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl border-[4px] border-hero-ink shadow-comic-sm font-hero text-7xl"
                    style={{ color: p.color }}
                  >
                    {p.letter}
                  </div>
                  <div className="flex-1">
                    <div className="font-hero text-3xl tracking-wide text-hero-ink">
                      {p.hero_name}
                    </div>
                    <div className="font-body text-lg font-bold text-slate-700 mt-1">
                      Sounds like: <span className="text-hero-red">"{p.sound}"</span>
                    </div>
                    <div className="font-body text-base font-bold text-slate-600 mt-1">
                      {p.letter} is for <span className="text-hero-blue">{p.example_word}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white flex gap-3">
                  <ComicButton
                    onClick={() => playPhonic(p)}
                    variant="accent"
                    size="md"
                    className="flex items-center gap-2"
                    data-testid="phonic-play-again"
                  >
                    <Volume2 className="w-5 h-5" strokeWidth={3} /> HEAR AGAIN
                  </ComicButton>
                </div>
              </ComicCard>
            ))}
        </div>
      )}
    </div>
  );
}
