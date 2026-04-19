import React from "react";

export function PowBurst({ show, text = "POW!" }) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      data-testid="pow-burst"
    >
      <div
        className="animate-pow font-hero text-8xl md:text-9xl text-hero-yellow"
        style={{
          WebkitTextStroke: "4px #0F172A",
          filter: "drop-shadow(6px 6px 0 #E53935)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
