# Hero Phonics

English-learning web app for young learners: **phonics**, **vocabulary**, and **stories** with tap-to-hear TTS, progress stars, and an **admin** area for managing content. The UI uses a comic-book, neo-brutalist style (React + Tailwind).

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Create React App, React Router, Tailwind CSS 3, Radix UI, Axios |
| Backend | FastAPI, Motor (async MongoDB), JWT (python-jose), bcrypt |
| Data | MongoDB (`users`, `phonics`, `words`, `stories`) |
| Speech | OpenAI TTS (`https://api.openai.com/v1/audio/speech`, requires `OPENAI_API_KEY`) |

On first startup the API **seeds** demo users, A–Z phonics, starter words, and stories if the database collections are empty.

## Prerequisites

- **Python** 3.11+ (matches tested environment)
- **Node.js** 18+ and **Yarn** or npm (repo includes `frontend/yarn.lock`)
- **MongoDB** reachable from your machine (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local `mongod`)

## 1. Backend

From the repo root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (do not commit real secrets) with at least:

| Variable | Purpose |
| --- | --- |
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret for signing access tokens |
| `OPENAI_API_KEY` | OpenAI API key for TTS (`POST /api/tts`) |

Optional:

| Variable | Default |
| --- | --- |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_MINUTES` | `10080` (7 days) |

Start the API (listens on **port 8001**):

```bash
python server.py
```

Health check: `GET http://localhost:8001/api/health` → `{"status":"ok"}`.

### Backend tests

With the server running and the same base URL the frontend uses:

```bash
cd backend
source .venv/bin/activate
REACT_APP_BACKEND_URL=http://localhost:8001 pytest tests/ -q
```

## 2. Frontend

```bash
cd frontend
yarn install    # or: npm install
```

Create `frontend/.env` (CRA reads `REACT_APP_*` at build/start time):

```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the dev server (default **http://localhost:3000**):

```bash
yarn start      # or: npm start
```

Open the app in the browser, sign up or log in.

## Demo accounts (seeded on first API start)

If these users are not already in the database, they are created when the backend starts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@hero.com` | `admin123` |
| Learner | `kid@hero.com` | `hero123` |

Admins see an **ADMIN** button on the dashboard for CRUD on phonics, words, and stories.

## Project layout

- `backend/server.py` — FastAPI app, auth, CRUD, progress, TTS, seeding
- `backend/tests/` — API tests (`requests` + pytest)
- `frontend/src/` — pages (`Dashboard`, `PhonicsTab`, `WordsTab`, `StoriesTab`, `AdminPage`, `LoginPage`), `lib/api.js`, `lib/auth.jsx`, `lib/tts.js`
- `memory/PRD.md` — product notes and feature list

## Troubleshooting

- **Frontend cannot reach API**: Confirm `REACT_APP_BACKEND_URL` has **no** trailing slash and matches the URL where `server.py` is listening (`http://localhost:8001`).
- **TTS errors**: Set `OPENAI_API_KEY` with a valid [OpenAI API key](https://platform.openai.com/api-keys). The server calls OpenAI’s speech endpoint directly (`httpx`).
- **MongoDB errors**: Check `MONGO_URL` and `DB_NAME`; ensure your IP is allowed if using Atlas.
