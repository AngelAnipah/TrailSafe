import Link from "next/link";

export default function TrailNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-5 text-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a4613c]">Trail not found</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-[#173d32]">This trail is off our map.</h1><p className="mt-3 max-w-md text-[#60786d]">The trail link may be outdated, or this route is not part of the current TrailSafe demo.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-[#1e5a45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174a39] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c]">Back to Trails</Link></div></main>;
}
