# Hero Phonics - PRD

## Original Problem Statement
Generate an application for new English learner kids for reading with phonics, with 3 tabs:
- Learning phonic sounds
- Learn simple words including meaning and pronunciation
- Story reading where clicking a word pronounces the name

## User Choices
- TTS: AI-powered (OpenAI TTS via Emergent LLM Key)
- Content: Admin panel for dynamic CRUD
- Progress: Basic tracking (phonics learned, words learned, stories read, stars)
- Theme: Marvel-inspired superhero (comic-book Neo-Brutalist)
- Auth: Simple JWT email/password user accounts

## User Personas
- **Kids (4-8)**: Learn phonics, words, read stories; tap letters/words to hear sounds
- **Parents/Teachers**: Create accounts, monitor kid's progress
- **Admin**: Manage (add/edit/delete) phonics, words and stories from admin panel

## Architecture
- **Frontend**: React 18 + TailwindCSS 3 (Bebas Neue + Nunito fonts, Neo-Brutalist design)
- **Backend**: FastAPI + Motor (async MongoDB) + JWT auth + bcrypt
- **TTS**: OpenAI `POST /v1/audio/speech` via `httpx` (model `tts-1`, voices e.g. `nova`/`fable`; `OPENAI_API_KEY`)
- **Database**: MongoDB collections — `users`, `phonics`, `words`, `stories`

## Implemented Features (Jan 2026)
- JWT auth (signup, login, `/auth/me`)
- 26 seeded phonics (A-Z with superhero mascot names, sounds, example words, colors)
- 16 seeded words with emoji, meaning, category
- 4 seeded stories with titles, emoji, full content
- TTS endpoint returning base64 mp3 (client caches to reduce cost)
- Admin CRUD for phonics, words, stories
- Progress tracking: stars counter + lesson arrays, no-duplicate increment
- Comic-book UI: thick black borders, offset shadows, halftone background, POW! burst animation
- Three-tab dashboard with animated progress bars

## Test Credentials
- Admin: `admin@hero.com` / `admin123`
- Kid demo: `kid@hero.com` / `hero123`

## Backlog / Next Steps (P1/P2)
- P1: Hero avatar illustrations per letter (image gen)
- P1: Audio caching on backend for repeat TTS requests
- P2: Story-by-story difficulty levels (beginner/intermediate)
- P2: Phonics games (drag letter to matching picture)
- P2: Multiple kid profiles under one parent account
- P2: Daily streaks and badges

## Status
MVP complete — all 26 backend tests + all frontend flows passed (100% success on iteration 1).
