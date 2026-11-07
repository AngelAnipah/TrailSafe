import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-[#dfe5dd] bg-[#f7f5ef]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight text-[#153f31] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c]" aria-label="TrailSafe UT home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1e5a45] text-white shadow-sm"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2]"><path d="m3 19 6-10 3 5 3-7 6 12" /><path d="M4 19h16" /></svg></span><span>TrailSafe <span className="text-[#ba6e45]">UT</span></span></Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-[#537064] sm:flex"><Link href="/#trails" className="rounded-lg transition hover:text-[#1e5a45] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c]">Find trails</Link><Link href="/#how-it-works" className="rounded-lg transition hover:text-[#1e5a45] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c]">How it works</Link></div>
        <Link href="/#trails" className="rounded-full bg-[#1e5a45] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174a39] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c]">Explore trails</Link>
      </nav>
    </header>
  );
}
