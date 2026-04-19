import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { ComicCard, ComicInput, ComicLabel, ComicTextarea } from "../components/ui/ComicCard";
import { ComicButton } from "../components/ui/ComicButton";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";

function Section({ title, children }) {
  return (
    <ComicCard className="mb-8">
      <div className="bg-hero-ink text-white p-4 border-b-[4px] border-hero-ink">
        <h3 className="font-hero text-3xl tracking-wide">{title}</h3>
      </div>
      <div className="p-5 bg-white">{children}</div>
    </ComicCard>
  );
}

function PhonicsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ letter: "", sound: "", hero_name: "", example_word: "", color: "#2962FF" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const r = await api.get("/phonics");
    setItems(r.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/phonics/${editingId}`, form);
    } else {
      await api.post("/phonics", form);
    }
    setForm({ letter: "", sound: "", hero_name: "", example_word: "", color: "#2962FF" });
    setEditingId(null);
    load();
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ letter: p.letter, sound: p.sound, hero_name: p.hero_name, example_word: p.example_word, color: p.color || "#2962FF" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this phonic?")) return;
    await api.delete(`/phonics/${id}`);
    load();
  };

  return (
    <Section title="PHONICS MANAGER">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6" data-testid="phonic-form">
        <div>
          <ComicLabel>LETTER</ComicLabel>
          <ComicInput data-testid="phonic-letter" maxLength={1} value={form.letter} onChange={(e) => setForm({ ...form, letter: e.target.value })} required />
        </div>
        <div>
          <ComicLabel>SOUND</ComicLabel>
          <ComicInput data-testid="phonic-sound" value={form.sound} onChange={(e) => setForm({ ...form, sound: e.target.value })} placeholder="aah" required />
        </div>
        <div>
          <ComicLabel>HERO NAME</ComicLabel>
          <ComicInput data-testid="phonic-hero" value={form.hero_name} onChange={(e) => setForm({ ...form, hero_name: e.target.value })} required />
        </div>
        <div>
          <ComicLabel>EXAMPLE WORD</ComicLabel>
          <ComicInput data-testid="phonic-example" value={form.example_word} onChange={(e) => setForm({ ...form, example_word: e.target.value })} required />
        </div>
        <div>
          <ComicLabel>COLOR</ComicLabel>
          <input data-testid="phonic-color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-[50px] rounded-xl border-[3px] border-hero-ink" />
        </div>
        <div className="md:col-span-5 flex gap-2">
          <ComicButton type="submit" variant="success" size="md" data-testid="phonic-submit">
            {editingId ? <><Save className="w-5 h-5 mr-1 inline" strokeWidth={3}/> UPDATE</> : <><Plus className="w-5 h-5 mr-1 inline" strokeWidth={3}/> ADD</>}
          </ComicButton>
          {editingId && (
            <ComicButton type="button" variant="ghost" size="md" onClick={() => { setEditingId(null); setForm({ letter: "", sound: "", hero_name: "", example_word: "", color: "#2962FF" }); }}>
              <X className="w-5 h-5 mr-1 inline" strokeWidth={3}/> CANCEL
            </ComicButton>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-[3px] border-hero-ink">
          <thead className="bg-hero-yellow">
            <tr className="font-hero text-lg tracking-wide">
              <th className="p-3 border-[2px] border-hero-ink text-left">LETTER</th>
              <th className="p-3 border-[2px] border-hero-ink text-left">SOUND</th>
              <th className="p-3 border-[2px] border-hero-ink text-left">HERO</th>
              <th className="p-3 border-[2px] border-hero-ink text-left">WORD</th>
              <th className="p-3 border-[2px] border-hero-ink text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="font-body font-bold bg-white">
                <td className="p-3 border-[2px] border-hero-ink text-2xl font-hero" style={{ color: p.color }}>{p.letter}</td>
                <td className="p-3 border-[2px] border-hero-ink">{p.sound}</td>
                <td className="p-3 border-[2px] border-hero-ink">{p.hero_name}</td>
                <td className="p-3 border-[2px] border-hero-ink">{p.example_word}</td>
                <td className="p-3 border-[2px] border-hero-ink">
                  <div className="flex gap-2">
                    <button onClick={() => edit(p)} data-testid={`edit-phonic-${p.letter}`} className="p-2 bg-hero-blue text-white rounded-lg border-[2px] border-hero-ink hover:bg-[#1565C0]"><Edit3 className="w-4 h-4" strokeWidth={3}/></button>
                    <button onClick={() => del(p.id)} data-testid={`del-phonic-${p.letter}`} className="p-2 bg-hero-red text-white rounded-lg border-[2px] border-hero-ink hover:bg-[#D32F2F]"><Trash2 className="w-4 h-4" strokeWidth={3}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function WordsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ word: "", meaning: "", emoji: "✨", category: "general" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const r = await api.get("/words");
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/words/${editingId}`, form);
    else await api.post("/words", form);
    setForm({ word: "", meaning: "", emoji: "✨", category: "general" });
    setEditingId(null);
    load();
  };

  const edit = (w) => {
    setEditingId(w.id);
    setForm({ word: w.word, meaning: w.meaning, emoji: w.emoji || "✨", category: w.category || "general" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this word?")) return;
    await api.delete(`/words/${id}`);
    load();
  };

  return (
    <Section title="WORDS MANAGER">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6" data-testid="word-form">
        <div>
          <ComicLabel>WORD</ComicLabel>
          <ComicInput data-testid="word-input" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} required />
        </div>
        <div>
          <ComicLabel>EMOJI</ComicLabel>
          <ComicInput data-testid="word-emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
        <div>
          <ComicLabel>CATEGORY</ComicLabel>
          <ComicInput data-testid="word-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="md:col-span-4">
          <ComicLabel>MEANING</ComicLabel>
          <ComicTextarea data-testid="word-meaning" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} required rows={2}/>
        </div>
        <div className="md:col-span-4 flex gap-2">
          <ComicButton type="submit" variant="success" size="md" data-testid="word-submit">
            {editingId ? <><Save className="w-5 h-5 mr-1 inline" strokeWidth={3}/> UPDATE</> : <><Plus className="w-5 h-5 mr-1 inline" strokeWidth={3}/> ADD</>}
          </ComicButton>
          {editingId && <ComicButton type="button" variant="ghost" size="md" onClick={() => { setEditingId(null); setForm({ word: "", meaning: "", emoji: "✨", category: "general" }); }}>CANCEL</ComicButton>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((w) => (
          <div key={w.id} className="border-[3px] border-hero-ink rounded-xl p-3 bg-white flex items-center gap-3">
            <div className="text-4xl">{w.emoji}</div>
            <div className="flex-1">
              <div className="font-hero text-2xl text-hero-red">{w.word}</div>
              <div className="font-body text-sm font-bold text-slate-700 line-clamp-2">{w.meaning}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => edit(w)} data-testid={`edit-word-${w.word}`} className="p-2 bg-hero-blue text-white rounded-lg border-[2px] border-hero-ink"><Edit3 className="w-4 h-4" strokeWidth={3}/></button>
              <button onClick={() => del(w.id)} data-testid={`del-word-${w.word}`} className="p-2 bg-hero-red text-white rounded-lg border-[2px] border-hero-ink"><Trash2 className="w-4 h-4" strokeWidth={3}/></button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function StoriesAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", emoji: "📖" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const r = await api.get("/stories");
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/stories/${editingId}`, form);
    else await api.post("/stories", form);
    setForm({ title: "", content: "", emoji: "📖" });
    setEditingId(null);
    load();
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({ title: s.title, content: s.content, emoji: s.emoji || "📖" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    await api.delete(`/stories/${id}`);
    load();
  };

  return (
    <Section title="STORIES MANAGER">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6" data-testid="story-form">
        <div className="md:col-span-4">
          <ComicLabel>TITLE</ComicLabel>
          <ComicInput data-testid="story-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <ComicLabel>EMOJI</ComicLabel>
          <ComicInput data-testid="story-emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
        <div className="md:col-span-6">
          <ComicLabel>CONTENT</ComicLabel>
          <ComicTextarea data-testid="story-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6}/>
        </div>
        <div className="md:col-span-6 flex gap-2">
          <ComicButton type="submit" variant="success" size="md" data-testid="story-submit">
            {editingId ? <><Save className="w-5 h-5 mr-1 inline" strokeWidth={3}/> UPDATE</> : <><Plus className="w-5 h-5 mr-1 inline" strokeWidth={3}/> ADD</>}
          </ComicButton>
          {editingId && <ComicButton type="button" variant="ghost" size="md" onClick={() => { setEditingId(null); setForm({ title: "", content: "", emoji: "📖" }); }}>CANCEL</ComicButton>}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="border-[3px] border-hero-ink rounded-xl p-4 bg-white flex items-start gap-3">
            <div className="text-4xl">{s.emoji}</div>
            <div className="flex-1">
              <div className="font-hero text-2xl text-hero-blue">{s.title}</div>
              <div className="font-body text-sm font-bold text-slate-700 line-clamp-2">{s.content}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => edit(s)} data-testid={`edit-story-${s.id}`} className="p-2 bg-hero-blue text-white rounded-lg border-[2px] border-hero-ink"><Edit3 className="w-4 h-4" strokeWidth={3}/></button>
              <button onClick={() => del(s.id)} data-testid={`del-story-${s.id}`} className="p-2 bg-hero-red text-white rounded-lg border-[2px] border-hero-ink"><Trash2 className="w-4 h-4" strokeWidth={3}/></button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-page">
      <div className="mb-6">
        <h1 className="font-hero text-5xl tracking-wide text-hero-ink">ADMIN HQ</h1>
        <p className="font-body text-lg font-bold text-slate-700">Manage phonics, words and stories</p>
      </div>
      <PhonicsAdmin />
      <WordsAdmin />
      <StoriesAdmin />
    </div>
  );
}
