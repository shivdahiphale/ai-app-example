"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hero_phonics_progress_v1";

export type ProgressState = {
  stars: number;
  phonics_learned: string[];
  words_learned: string[];
  stories_read: string[];
};

const empty: ProgressState = {
  stars: 0,
  phonics_learned: [],
  words_learned: [],
  stories_read: [],
};

function load(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Partial<ProgressState>;
    return {
      stars: typeof p.stars === "number" ? p.stars : 0,
      phonics_learned: Array.isArray(p.phonics_learned) ? p.phonics_learned : [],
      words_learned: Array.isArray(p.words_learned) ? p.words_learned : [],
      stories_read: Array.isArray(p.stories_read) ? p.stories_read : [],
    };
  } catch {
    return empty;
  }
}

function save(p: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(load());
    setHydrated(true);
  }, []);

  const recordProgress = useCallback((type: "phonic" | "word" | "story", itemId: string) => {
    setProgress((prev) => {
      const field =
        type === "phonic"
          ? "phonics_learned"
          : type === "word"
            ? "words_learned"
            : "stories_read";
      const arr = prev[field];
      if (arr.includes(itemId)) return prev;
      const next: ProgressState = {
        ...prev,
        [field]: [...arr, itemId],
        stars: prev.stars + 1,
      };
      save(next);
      return next;
    });
  }, []);

  return { progress, recordProgress, hydrated };
}
