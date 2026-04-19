# Hero Phonics

Single **Next.js** app for young learners: phonics grid, vocabulary cards, and clickable-word stories with **text-to-speech** (ElevenLabs). **Material UI** layout (mobile-friendly bottom navigation on small screens). **No login** — progress (stars and completed items) is stored in **localStorage**. Curriculum lives in **JSON** under `public/data/`.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Material UI (MUI)** + Emotion
- **ElevenLabs** via `POST /api/tts` (API key stays on the server)

## Prerequisites

- **Node.js** 20+ (LTS recommended)

## Run locally

```bash
cp .env.example .env.local
```

Edit `.env.local`: set `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`). Without a key, TTS requests return 503 and the UI falls back to the browser’s speech synthesis when possible.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

## Content

Edit curriculum JSON (no rebuild required for `public/` in dev):

- [`public/data/phonics.json`](public/data/phonics.json)
- [`public/data/words.json`](public/data/words.json)
- [`public/data/stories.json`](public/data/stories.json)

Each item needs a stable string `id` (used for progress tracking).

## Project layout

- [`src/app/`](src/app/) — `layout.tsx`, `page.tsx`, `globals.css`, `api/tts/route.ts`
- [`src/components/`](src/components/) — dashboard, tabs, MUI screens
- [`src/hooks/useProgress.ts`](src/hooks/useProgress.ts) — localStorage progress

## Deploy notes

Point your host (e.g. **Vercel**) at the **repository root** — `package.json`, `next.config.ts`, and `src/` must be at the project root so `next build` runs correctly.

`/api/tts` needs a **Node** runtime. **Static export** (`output: 'export'`) is not compatible with this API route unless you host TTS elsewhere.
