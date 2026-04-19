import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { speak } from "../lib/tts";
import { ComicCard } from "../components/ui/ComicCard";
import { ComicButton } from "../components/ui/ComicButton";
import { ArrowLeft, Volume2, BookOpen } from "lucide-react";

function cleanWord(w) {
  return w.replace(/[^a-zA-Z']/g, "");
}

export default function StoriesTab({ onProgress, read = [] }) {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [speakingWord, setSpeakingWord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stories").then((r) => {
      setStories(r.data);
      setLoading(false);
    });
  }, []);

  const openStory = async (s) => {
    setActiveStory(s);
    try {
      if (!read.includes(s.id)) {
        await api.post("/progress", { type: "story", item_id: s.id });
        onProgress && onProgress();
      }
    } catch (e) {}
  };

  const handleWordClick = async (word, key) => {
    const clean = cleanWord(word);
    if (!clean) return;
    setSpeakingWord(key);
    await speak(clean, "nova", () => setSpeakingWord(null));
    setTimeout(() => setSpeakingWord(null), 1200);
  };

  const readWholeStory = async () => {
    if (!activeStory) return;
    // Chunk ~4000 chars, but our stories are short
    await speak(activeStory.content, "fable");
  };

  if (loading) {
    return <div className="text-center font-hero text-3xl py-20">LOADING STORIES...</div>;
  }

  if (activeStory) {
    const words = activeStory.content.split(/(\s+)/);
    return (
      <div data-testid="story-view">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <ComicButton
            onClick={() => setActiveStory(null)}
            variant="ghost"
            size="md"
            className="flex items-center gap-2"
            data-testid="back-to-stories"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} /> BACK
          </ComicButton>
          <ComicButton
            onClick={readWholeStory}
            variant="primary"
            size="md"
            className="flex items-center gap-2"
            data-testid="read-whole-story"
          >
            <Volume2 className="w-5 h-5" strokeWidth={3} /> READ ALOUD
          </ComicButton>
        </div>

        <ComicCard>
          <div className="p-6 bg-hero-blue text-white border-b-[4px] border-hero-ink flex items-center gap-4">
            <div className="text-6xl">{activeStory.emoji || "📖"}</div>
            <h2 className="font-hero text-4xl md:text-5xl tracking-wide">
              {activeStory.title}
            </h2>
          </div>
          <div className="p-6 md:p-8 bg-white">
            <p className="font-body text-xl md:text-2xl font-bold leading-relaxed text-hero-ink">
              {words.map((chunk, i) => {
                if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
                const key = `${i}-${chunk}`;
                const isSpeaking = speakingWord === key;
                return (
                  <span
                    key={key}
                    onClick={() => handleWordClick(chunk, key)}
                    data-testid={`story-word-${i}`}
                    className={`inline-block px-1 rounded-md cursor-pointer transition-all duration-150 hover:bg-hero-yellow hover:scale-110 active:scale-95 ${
                      isSpeaking ? "word-speaking" : ""
                    }`}
                  >
                    {chunk}
                  </span>
                );
              })}
            </p>
            <div className="mt-6 p-4 bg-hero-cream rounded-xl border-[3px] border-dashed border-hero-ink">
              <p className="font-body text-sm font-black text-slate-700 uppercase tracking-wide">
                💡 Tip: Tap any word to hear it!
              </p>
            </div>
          </div>
        </ComicCard>
      </div>
    );
  }

  return (
    <div data-testid="stories-tab">
      <div className="mb-6">
        <h2 className="font-hero text-4xl md:text-5xl tracking-wide text-hero-ink mb-2">
          HERO STORIES
        </h2>
        <p className="font-body text-lg font-bold text-slate-700">
          Pick a story and tap any word to hear how it sounds!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((s) => {
          const done = read.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => openStory(s)}
              data-testid={`story-${s.id}`}
              className="text-left"
            >
              <ComicCard className="hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0F172A] transition-all h-full">
                <div className="p-5 flex gap-4 items-center border-b-[4px] border-hero-ink bg-hero-yellow">
                  <div className="text-6xl">{s.emoji || "📖"}</div>
                  <div className="flex-1">
                    <h3 className="font-hero text-2xl md:text-3xl tracking-wide text-hero-ink">
                      {s.title}
                    </h3>
                    {done && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-hero-green text-hero-ink font-body text-xs font-black uppercase rounded-full border-[2px] border-hero-ink">
                        ✓ READ
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <p className="font-body text-base font-bold text-slate-700 line-clamp-3">
                    {s.content.slice(0, 120)}...
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-hero-red font-hero text-lg tracking-wide">
                    <BookOpen className="w-5 h-5" strokeWidth={3} />
                    START READING
                  </div>
                </div>
              </ComicCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}
