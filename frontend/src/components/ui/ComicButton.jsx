import React from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-hero-red text-white hover:bg-[#D32F2F]",
  secondary: "bg-hero-blue text-white hover:bg-[#1565C0]",
  accent: "bg-hero-yellow text-hero-ink hover:bg-[#FDD835]",
  success: "bg-hero-green text-hero-ink hover:bg-[#00C853]",
  ghost: "bg-white text-hero-ink hover:bg-hero-cream",
};

const SIZES = {
  sm: "text-lg px-4 py-2 border-[3px] shadow-comic-xs",
  md: "text-xl px-6 py-2.5 border-[3px] shadow-comic-sm",
  lg: "text-2xl px-8 py-3 border-[4px] shadow-comic-sm",
  xl: "text-3xl px-10 py-4 border-[4px] shadow-comic",
};

export const ComicButton = React.forwardRef(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-hero uppercase tracking-wider rounded-xl border-hero-ink",
          "transition-all duration-150 comic-press",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ComicButton.displayName = "ComicButton";
