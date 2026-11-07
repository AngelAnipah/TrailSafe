"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="group flex w-full items-center gap-3 rounded-2xl border border-[#d8e1d7] bg-white px-4 py-3.5 shadow-[0_8px_25px_rgba(21,63,49,0.08)] transition focus-within:border-[#4e8d71] focus-within:ring-4 focus-within:ring-[#dff0e4]"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-none stroke-[#5f786e] stroke-2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg><span className="sr-only">Search Utah trails</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search Utah trails, parks, or regions" className="min-w-0 flex-1 bg-transparent text-sm text-[#173d32] outline-none placeholder:text-[#84968e] sm:text-base" /><kbd className="hidden rounded border border-[#e2e7df] bg-[#f7f8f4] px-2 py-1 text-[10px] font-medium text-[#789086] sm:inline">⌘ K</kbd></label>;
}
