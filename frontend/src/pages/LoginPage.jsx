import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { ComicButton } from "../components/ui/ComicButton";
import { ComicCard, ComicInput, ComicLabel } from "../components/ui/ComicCard";
import { Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-cream relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* halftone texture */}
      <div className="absolute inset-0 halftone-bg pointer-events-none" />

      {/* comic-style bursts */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-hero-red rounded-full border-[4px] border-hero-ink opacity-20 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-hero-blue rounded-full border-[4px] border-hero-ink opacity-20 hidden md:block" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-hero-yellow border-[4px] border-hero-ink hidden md:block" style={{ transform: "rotate(15deg)" }} />

      <ComicCard className="w-full max-w-md relative z-10" data-testid="auth-card">
        <div className="bg-hero-red text-white p-5 border-b-[4px] border-hero-ink flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-9 h-9" strokeWidth={3} />
            <div>
              <h1 className="font-hero text-3xl tracking-wider">HERO PHONICS</h1>
              <p className="font-body text-sm font-bold opacity-90">Learn English like a Super Hero!</p>
            </div>
          </div>
          <Sparkles className="w-7 h-7 text-hero-yellow" strokeWidth={3} />
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4" data-testid="auth-form">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("login")}
              data-testid="switch-login-tab"
              className={`flex-1 py-3 font-hero text-2xl tracking-wide rounded-xl border-[3px] border-hero-ink transition-all ${
                mode === "login"
                  ? "bg-hero-yellow shadow-comic-sm"
                  : "bg-white hover:bg-hero-cream"
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              data-testid="switch-signup-tab"
              className={`flex-1 py-3 font-hero text-2xl tracking-wide rounded-xl border-[3px] border-hero-ink transition-all ${
                mode === "signup"
                  ? "bg-hero-yellow shadow-comic-sm"
                  : "bg-white hover:bg-hero-cream"
              }`}
            >
              SIGN UP
            </button>
          </div>

          {mode === "signup" && (
            <div>
              <ComicLabel>HERO NAME</ComicLabel>
              <ComicInput
                data-testid="name-input"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your awesome name"
                required
              />
            </div>
          )}

          <div>
            <ComicLabel>EMAIL</ComicLabel>
            <ComicInput
              data-testid="email-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="hero@email.com"
              required
            />
          </div>

          <div>
            <ComicLabel>SECRET CODE</ComicLabel>
            <ComicInput
              data-testid="password-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your super password"
              required
              minLength={4}
            />
          </div>

          {error && (
            <div
              data-testid="auth-error"
              className="bg-hero-red text-white font-bold p-3 rounded-xl border-[3px] border-hero-ink"
            >
              {error}
            </div>
          )}

          <ComicButton
            data-testid="auth-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "LOADING..." : mode === "signup" ? "JOIN THE HEROES" : "ENTER THE BASE"}
          </ComicButton>

          <div className="text-center pt-3 border-t-2 border-dashed border-hero-ink/20">
            <p className="font-body text-sm font-bold text-slate-600">
              Try: <span className="text-hero-red">kid@hero.com</span> / hero123
            </p>
            <p className="font-body text-xs font-bold text-slate-500 mt-1">
              Admin: admin@hero.com / admin123
            </p>
          </div>
        </form>
      </ComicCard>
    </div>
  );
}
