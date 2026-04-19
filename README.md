# Hero Phonics

Single **Next.js** app for young learners: phonics grid, vocabulary cards, and clickable-word stories with **text-to-speech** (ElevenLabs). Comic-book UI (Tailwind CSS v4). **No login** — progress (stars and completed items) is stored in **localStorage**. Curriculum lives in **JSON** under `web/public/data/`.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Tailwind CSS v4**
- **ElevenLabs** via `POST /api/tts` (API key stays on the server)

## Prerequisites

- **Node.js** 20+ (LTS recommended)

## Run locally

```bash
cd web
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
cd web
npm run build
npm start
```

## Content

Edit curriculum JSON (no rebuild required for `public/` in dev):

- [`web/public/data/phonics.json`](web/public/data/phonics.json)
- [`web/public/data/words.json`](web/public/data/words.json)
- [`web/public/data/stories.json`](web/public/data/stories.json)

Each item needs a stable string `id` (used for progress tracking).

## Project layout

- [`web/src/app/`](web/src/app/) — `layout.tsx`, `page.tsx`, `globals.css`, `api/tts/route.ts`
- [`web/src/components/`](web/src/components/) — dashboard, tabs, comic UI
- [`web/src/hooks/useProgress.ts`](web/src/hooks/useProgress.ts) — localStorage progress

## Deploy notes

`/api/tts` needs a **Node** runtime (e.g. Vercel). **Static export** (`output: 'export'`) is not compatible with this API route unless you host TTS elsewhere.
