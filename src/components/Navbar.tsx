import Link from "next/link";
import { Gamepad2, Search, Heart } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-purple-500 border-2 border-black p-1 group-hover:-rotate-6 transition-transform">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-sans font-black text-2xl tracking-tighter uppercase italic">
            Uni<span className="text-purple-600 underline">Games</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search games..."
            className="w-full bg-gray-100 border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-400 transition-all"
          />
          <Search className="absolute right-3 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/favorites"
            className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          >
            <Heart className="w-6 h-6" />
          </Link>
          <Link
            href={"/library"}
            className="hidden sm:block bg-black text-white border-2 border-black px-6 py-2 font-sans font-bold uppercase tracking-widest text-xs hover:bg-purple-600 hover:translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 transition-all shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]"
          >
            Explore
          </Link>
        </div>
      </div>
    </nav>
  );
}
