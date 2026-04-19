import React from "react";
import { cn } from "../../lib/utils";

export const ComicCard = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl border-[4px] border-hero-ink shadow-comic overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ComicCard.displayName = "ComicCard";

export const ComicInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-white rounded-xl border-[3px] border-hero-ink px-4 py-3",
        "font-body text-lg font-bold text-hero-ink placeholder:text-slate-400",
        "focus:outline-none focus:shadow-comic-sm focus:-translate-y-0.5 transition-all",
        className
      )}
      {...props}
    />
  );
});
ComicInput.displayName = "ComicInput";

export const ComicLabel = ({ children, className, ...props }) => (
  <label
    className={cn("block font-hero text-xl text-hero-ink mb-1 tracking-wide", className)}
    {...props}
  >
    {children}
  </label>
);

export const ComicTextarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full bg-white rounded-xl border-[3px] border-hero-ink px-4 py-3",
      "font-body text-base font-bold text-hero-ink placeholder:text-slate-400",
      "focus:outline-none focus:shadow-comic-sm transition-all resize-y min-h-[120px]",
      className
    )}
    {...props}
  />
));
ComicTextarea.displayName = "ComicTextarea";
