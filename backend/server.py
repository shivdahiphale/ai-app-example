import os
import uuid
import base64
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError
import httpx

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Config ---
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "10080"))

# --- DB ---
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# --- Security ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# --- Models ---
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=4)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class PhonicCreate(BaseModel):
    letter: str
    sound: str
    hero_name: str
    example_word: str
    color: Optional[str] = "#2962FF"


class PhonicUpdate(BaseModel):
    letter: Optional[str] = None
    sound: Optional[str] = None
    hero_name: Optional[str] = None
    example_word: Optional[str] = None
    color: Optional[str] = None


class WordCreate(BaseModel):
    word: str
    meaning: str
    emoji: Optional[str] = "✨"
    category: Optional[str] = "general"


class WordUpdate(BaseModel):
    word: Optional[str] = None
    meaning: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None


class StoryCreate(BaseModel):
    title: str
    content: str
    emoji: Optional[str] = "📖"


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    emoji: Optional[str] = None


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "nova"


class ProgressUpdate(BaseModel):
    type: str  # "phonic" | "word" | "story"
    item_id: str


# --- App ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_initial_data()
    yield
    mongo_client.close()


app = FastAPI(lifespan=lifespan, title="Hero Phonics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


# --- Auth Routes ---
@api.post("/auth/signup", response_model=AuthResponse)
async def signup(data: UserSignup):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "role": "user",
        "stars": 0,
        "phonics_learned": [],
        "words_learned": [],
        "stories_read": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user_id})
    user_doc.pop("password", None)
    user_doc.pop("_id", None)
    return {"token": token, "user": user_doc}


@api.post("/auth/login", response_model=AuthResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user["id"]})
    user.pop("password", None)
    user.pop("_id", None)
    return {"token": token, "user": user}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# --- TTS ---
@api.post("/tts")
async def text_to_speech(req: TTSRequest, user: dict = Depends(get_current_user)):
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="TTS is not configured. Set OPENAI_API_KEY for OpenAI speech, or replace this handler with your provider.",
        )
    voice = (req.voice or "nova").lower()
    allowed = ("alloy", "echo", "fable", "onyx", "nova", "shimmer")
    if voice not in allowed:
        voice = "nova"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/audio/speech",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "tts-1",
                    "input": req.text[:4000],
                    "voice": voice,
                },
            )
        if r.status_code != 200:
            err = (r.text or r.reason_phrase)[:500]
            logger.error("OpenAI TTS error %s: %s", r.status_code, err)
            raise HTTPException(status_code=502, detail="TTS provider request failed")
        audio_b64 = base64.b64encode(r.content).decode("utf-8")
        return {"audio_base64": audio_b64, "format": "mp3"}
    except httpx.HTTPError as e:
        logger.error("TTS HTTP error: %s", e)
        raise HTTPException(status_code=502, detail="TTS request failed") from e


# --- Phonics (public read, admin write) ---
@api.get("/phonics")
async def list_phonics():
    items = await db.phonics.find({}, {"_id": 0}).sort("letter", 1).to_list(length=200)
    return items


@api.post("/phonics")
async def create_phonic(data: PhonicCreate, user: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["letter"] = doc["letter"].upper()[:1]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.phonics.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/phonics/{item_id}")
async def update_phonic(item_id: str, data: PhonicUpdate, user: dict = Depends(require_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if "letter" in update:
        update["letter"] = update["letter"].upper()[:1]
    result = await db.phonics.update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Phonic not found")
    doc = await db.phonics.find_one({"id": item_id}, {"_id": 0})
    return doc


@api.delete("/phonics/{item_id}")
async def delete_phonic(item_id: str, user: dict = Depends(require_admin)):
    result = await db.phonics.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Phonic not found")
    return {"ok": True}


# --- Words ---
@api.get("/words")
async def list_words():
    items = await db.words.find({}, {"_id": 0}).sort("word", 1).to_list(length=500)
    return items


@api.post("/words")
async def create_word(data: WordCreate, user: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.words.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/words/{item_id}")
async def update_word(item_id: str, data: WordUpdate, user: dict = Depends(require_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.words.update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Word not found")
    doc = await db.words.find_one({"id": item_id}, {"_id": 0})
    return doc


@api.delete("/words/{item_id}")
async def delete_word(item_id: str, user: dict = Depends(require_admin)):
    result = await db.words.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Word not found")
    return {"ok": True}


# --- Stories ---
@api.get("/stories")
async def list_stories():
    items = await db.stories.find({}, {"_id": 0}).sort("title", 1).to_list(length=200)
    return items


@api.get("/stories/{item_id}")
async def get_story(item_id: str):
    doc = await db.stories.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Story not found")
    return doc


@api.post("/stories")
async def create_story(data: StoryCreate, user: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.stories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/stories/{item_id}")
async def update_story(item_id: str, data: StoryUpdate, user: dict = Depends(require_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.stories.update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    doc = await db.stories.find_one({"id": item_id}, {"_id": 0})
    return doc


@api.delete("/stories/{item_id}")
async def delete_story(item_id: str, user: dict = Depends(require_admin)):
    result = await db.stories.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"ok": True}


# --- Progress ---
@api.post("/progress")
async def track_progress(data: ProgressUpdate, user: dict = Depends(get_current_user)):
    field_map = {
        "phonic": "phonics_learned",
        "word": "words_learned",
        "story": "stories_read",
    }
    field = field_map.get(data.type)
    if not field:
        raise HTTPException(status_code=400, detail="Invalid type")
    existing = user.get(field, []) or []
    if data.item_id not in existing:
        await db.users.update_one(
            {"id": user["id"]},
            {"$addToSet": {field: data.item_id}, "$inc": {"stars": 1}},
        )
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated


@api.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    return {
        "stars": user.get("stars", 0),
        "phonics_learned": user.get("phonics_learned", []),
        "words_learned": user.get("words_learned", []),
        "stories_read": user.get("stories_read", []),
    }


@api.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api)


# --- Seed ---
async def seed_initial_data():
    try:
        # Admin user
        admin = await db.users.find_one({"email": "admin@hero.com"})
        if not admin:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "name": "Admin",
                "email": "admin@hero.com",
                "password": hash_password("admin123"),
                "role": "admin",
                "stars": 0,
                "phonics_learned": [],
                "words_learned": [],
                "stories_read": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded admin user")

        # Demo user
        demo = await db.users.find_one({"email": "kid@hero.com"})
        if not demo:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "name": "Little Hero",
                "email": "kid@hero.com",
                "password": hash_password("hero123"),
                "role": "user",
                "stars": 0,
                "phonics_learned": [],
                "words_learned": [],
                "stories_read": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded demo user")

        # Phonics (26 letters with hero names)
        if await db.phonics.count_documents({}) == 0:
            phonics_data = [
                ("A", "aah", "Apple Avenger", "Apple", "#E53935"),
                ("B", "buh", "Bold Blaster", "Ball", "#2962FF"),
                ("C", "kuh", "Captain Cloud", "Cat", "#FFEB3B"),
                ("D", "duh", "Dynamo Dash", "Dog", "#00E676"),
                ("E", "eh", "Echo Eagle", "Egg", "#FF6F00"),
                ("F", "fuh", "Flame Fox", "Fish", "#E53935"),
                ("G", "guh", "Galaxy Guardian", "Goat", "#2962FF"),
                ("H", "huh", "Hyper Hawk", "Hat", "#FFEB3B"),
                ("I", "ih", "Ice Invincible", "Igloo", "#00BCD4"),
                ("J", "juh", "Jet Jumper", "Jug", "#9C27B0"),
                ("K", "kuh", "Kinetic Knight", "Kite", "#E53935"),
                ("L", "luh", "Lightning Lynx", "Lion", "#FFEB3B"),
                ("M", "muh", "Mighty Moon", "Moon", "#2962FF"),
                ("N", "nuh", "Nova Ninja", "Nest", "#00E676"),
                ("O", "oh", "Omega Orbit", "Octopus", "#FF6F00"),
                ("P", "puh", "Power Phoenix", "Pig", "#E53935"),
                ("Q", "kwuh", "Quantum Queen", "Queen", "#9C27B0"),
                ("R", "ruh", "Rocket Ranger", "Rabbit", "#2962FF"),
                ("S", "suh", "Sonic Scout", "Sun", "#FFEB3B"),
                ("T", "tuh", "Thunder Titan", "Tiger", "#00E676"),
                ("U", "uh", "Ultra Unicorn", "Umbrella", "#9C27B0"),
                ("V", "vuh", "Vortex Vigilante", "Van", "#E53935"),
                ("W", "wuh", "Warp Warrior", "Whale", "#2962FF"),
                ("X", "ks", "X-Ray Xeno", "Xylophone", "#FF6F00"),
                ("Y", "yuh", "Yeti Yardman", "Yak", "#FFEB3B"),
                ("Z", "zuh", "Zero Zapper", "Zebra", "#00E676"),
            ]
            docs = [
                {
                    "id": str(uuid.uuid4()),
                    "letter": l,
                    "sound": s,
                    "hero_name": h,
                    "example_word": e,
                    "color": c,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                for l, s, h, e, c in phonics_data
            ]
            await db.phonics.insert_many(docs)
            logger.info("Seeded 26 phonics")

        # Words
        if await db.words.count_documents({}) == 0:
            words_data = [
                ("Cat", "A small furry pet that says meow", "🐱", "animals"),
                ("Dog", "A friendly pet that barks and wags its tail", "🐶", "animals"),
                ("Sun", "The bright star that gives us light and warmth", "☀️", "nature"),
                ("Moon", "The round light in the night sky", "🌙", "nature"),
                ("Star", "Tiny twinkling lights in the sky at night", "⭐", "nature"),
                ("Apple", "A round red or green fruit that is sweet", "🍎", "food"),
                ("Ball", "A round toy you can bounce, throw, or kick", "⚽", "toys"),
                ("Book", "Pages with stories and pictures to read", "📚", "school"),
                ("Fish", "An animal that swims in water", "🐠", "animals"),
                ("Bird", "An animal with wings that can fly", "🐦", "animals"),
                ("Tree", "A tall plant with leaves and branches", "🌳", "nature"),
                ("Car", "A vehicle with four wheels that people drive", "🚗", "vehicles"),
                ("Hat", "Something you wear on your head", "🎩", "clothes"),
                ("Hero", "A brave person who helps and saves others", "🦸", "people"),
                ("Milk", "A white drink that helps you grow strong", "🥛", "food"),
                ("Train", "A long vehicle that runs on tracks", "🚂", "vehicles"),
            ]
            docs = [
                {
                    "id": str(uuid.uuid4()),
                    "word": w,
                    "meaning": m,
                    "emoji": e,
                    "category": c,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                for w, m, e, c in words_data
            ]
            await db.words.insert_many(docs)
            logger.info("Seeded words")

        # Stories
        if await db.stories.count_documents({}) == 0:
            stories_data = [
                (
                    "The Brave Little Hero",
                    "Once upon a time there was a little hero. He had a red cape and a big smile. Every day he would help people in his town. He helped a cat get down from a tree. He helped an old man cross the road. The little hero was kind and brave. Everyone loved him very much.",
                    "🦸",
                ),
                (
                    "A Day at the Park",
                    "Tim and Sam went to the park. The sun was bright and warm. They saw a big dog running fast. They played with a red ball. They ate a sweet apple for lunch. A bird sang in the tree. Tim and Sam had so much fun that day. They did not want to go home.",
                    "🌳",
                ),
                (
                    "The Magic Star",
                    "At night a little girl saw a star. The star was bright and shiny. The star winked at her. She made a wish for a new friend. The next day a new boy came to her school. They played and laughed all day. The magic star had heard her wish. She was very happy.",
                    "⭐",
                ),
                (
                    "Super Cat and the Big Fish",
                    "Super Cat wore a blue cape. He could run and jump very high. One day he saw a big fish stuck in a net. Super Cat swam fast to help the fish. He cut the net with his sharp claws. The fish was free at last. Super Cat was a real hero that day.",
                    "🐱",
                ),
            ]
            docs = [
                {
                    "id": str(uuid.uuid4()),
                    "title": t,
                    "content": c,
                    "emoji": e,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                for t, c, e in stories_data
            ]
            await db.stories.insert_many(docs)
            logger.info("Seeded stories")
    except Exception as e:
        logger.error(f"Seed error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
