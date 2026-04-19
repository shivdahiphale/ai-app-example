import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import PhonicsTab from "./PhonicsTab";
import WordsTab from "./WordsTab";
import StoriesTab from "./StoriesTab";
import AdminPage from "./AdminPage";
import { ComicButton } from "../components/ui/ComicButton";
import { Shield, Star, LogOut, Settings, Volume2, BookOpen, Sparkles } from "lucide-react";

const TABS = [
  { id: "phonics", label: "PHONICS", icon: Volume2, color: "#E53935" },
  { id: "words", label: "WORDS", icon: Sparkles, color: "#2962FF" },
  { id: "stories", label: "STORIES", icon: BookOpen, color: "#00E676" },
];

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [tab, setTab] = useState("phonics");
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Refresh user on mount to sync stars
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showAdmin && user?.role === "admin") {
    return (
      <div className="min-h-screen bg-hero-cream relative">
        <div className="absolute inset-0 halftone-bg pointer-events-none" />
        <header className="relative z-10 bg-hero-ink text-white border-b-[4px] border-hero-ink">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-hero-yellow" strokeWidth={3}/>
              <h1 className="font-hero text-3xl tracking-wider">ADMIN HQ</h1>
            </div>
            <div className="flex gap-2">
              <ComicButton variant="accent" size="sm" onClick={() => setShowAdmin(false)} data-testid="back-to-app">
                BACK TO APP
              </ComicButton>
              <ComicButton variant="primary" size="sm" onClick={logout} data-testid="logout-btn">
                <LogOut className="w-4 h-4 inline mr-1" strokeWidth={3}/> LOGOUT
              </ComicButton>
            </div>
          </div>
        </header>
        <div className="relative z-10"><AdminPage /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-cream relative" data-testid="dashboard">
      {/* halftone background */}
      <div className="absolute inset-0 halftone-bg pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 bg-hero-red text-white border-b-[4px] border-hero-ink shadow-comic-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-hero-yellow border-[3px] border-hero-ink rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-hero-ink" strokeWidth={3}/>
            </div>
            <div>
              <h1 className="font-hero text-3xl md:text-4xl tracking-wider leading-none">HERO PHONICS</h1>
              <p className="font-body text-xs md:text-sm font-black opacity-90 uppercase">Welcome, {user?.name}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-hero-yellow text-hero-ink px-4 py-2 rounded-xl border-[3px] border-hero-ink font-hero text-xl flex items-center gap-1 shadow-comic-xs" data-testid="stars-counter">
              <Star className="w-5 h-5 fill-hero-ink" strokeWidth={3}/>
              {user?.stars || 0}
            </div>
            {user?.role === "admin" && (
              <ComicButton variant="secondary" size="sm" onClick={() => setShowAdmin(true)} data-testid="open-admin-btn">
                <Settings className="w-4 h-4 inline mr-1" strokeWidth={3}/> ADMIN
              </ComicButton>
            )}
            <ComicButton variant="ghost" size="sm" onClick={logout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 inline mr-1" strokeWidth={3}/> OUT
            </ComicButton>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Phonics" value={user?.phonics_learned?.length || 0} total={26} color="#E53935"/>
          <StatCard label="Words" value={user?.words_learned?.length || 0} total={16} color="#2962FF"/>
          <StatCard label="Stories" value={user?.stories_read?.length || 0} total={4} color="#00E676"/>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-2 md:space-x-3 no-scrollbar overflow-x-auto pb-1" data-testid="tabs-nav">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-testid={`tab-${t.id}`}
                className={`flex items-center gap-2 border-[3px] border-hero-ink rounded-t-2xl rounded-b-none px-5 md:px-7 py-3 font-hero tracking-wide transition-all whitespace-nowrap ${
                  active
                    ? "bg-hero-yellow text-hero-ink text-2xl md:text-3xl border-b-0 -mb-1 shadow-comic-sm -translate-y-1"
                    : "bg-white text-hero-ink text-xl md:text-2xl hover:bg-hero-cream"
                }`}
                style={active ? { borderColor: t.color, borderBottomColor: "transparent" } : {}}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} style={{ color: active ? t.color : "#0F172A" }}/>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border-[4px] border-hero-ink rounded-2xl rounded-tl-none shadow-comic p-5 md:p-8 min-h-[500px]">
          {tab === "phonics" && <PhonicsTab onProgress={refreshUser} learned={user?.phonics_learned || []}/>}
          {tab === "words" && <WordsTab onProgress={refreshUser} learned={user?.words_learned || []}/>}
          {tab === "stories" && <StoriesTab onProgress={refreshUser} read={user?.stories_read || []}/>}
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 font-body text-sm font-bold text-slate-600">
        Made for little heroes 🦸‍♀️🦸‍♂️ • Hero Phonics 2026
      </footer>
    </div>
  );
}

function StatCard({ label, value, total, color }) {
  const percent = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="bg-white border-[4px] border-hero-ink rounded-2xl p-3 md:p-4 shadow-comic-sm" data-testid={`stat-${label.toLowerCase()}`}>
      <div className="flex items-center justify-between">
        <span className="font-hero text-lg md:text-2xl tracking-wide" style={{ color }}>{label}</span>
        <span className="font-hero text-xl md:text-2xl text-hero-ink">{value}/{total}</span>
      </div>
      <div className="mt-2 h-3 bg-hero-cream border-[2px] border-hero-ink rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }}/>
      </div>
    </div>
  );
}
