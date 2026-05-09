"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GAMES } from "@/data/games";
import {
  Maximize2,
  Heart,
  Share2,
  Gamepad,
  Info,
  ChevronLeft,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const game = GAMES.find((g) => g.id === id);
  const { favorites, toggleFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (game) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [game]);

  const handleFullscreen = () => {
    if (gameContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        gameContainerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`,
          );
        });
      }
    }
  };
  if (!game)
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4 text-red-600">
          Game Not Found
        </h2>
        <p className="font-mono text-gray-500 mb-8">
          The digital arcade machines are out for maintenance.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 font-black uppercase border-2 border-black hover:bg-purple-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );

  const isFavorite = favorites.includes(game.id);

  const relatedGames = GAMES.filter(
    (g) => g.category === game.category && g.id !== game.id,
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Breadcrumbs / Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors font-mono uppercase text-sm font-bold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Arcade
      </Link>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Game Viewport Container */}
          <div className="relative group bg-black border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <div className="aspect-video bg-gray-900 border-4 border-gray-800 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent animate-spin"></div>
                    <p className="font-mono text-purple-400 animate-pulse text-sm">
                      BOOTING GAME ENGINE...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="iframe"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full"
                    ref={gameContainerRef}
                  >
                    <game.component />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Viewport Bar */}
            <div className="bg-white border-t-4 border-black p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border-2 border-black text-[10px] font-mono font-bold uppercase text-green-700">
                  <Star className="w-3 h-3 fill-current" />
                  Official
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 border-2 cursor-pointer border-black hover:bg-gray-100 transition-colors"
                  title="Share"
                  onClick={() => toast("Link copied to clipboard!")}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleFavorite(id?.toString() ?? "")}
                  className={`p-2 border-2 cursor-pointer border-black hover:bg-gray-100 transition-colors ${isFavorite ? "text-red-500 fill-red-500" : ""}`}
                  title="Favorite"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="bg-black text-white border-2 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-2 hover:bg-purple-600 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  Fullscreen
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white border-4 border-black p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b-2 border-black border-dashed">
              <div>
                <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
                  {game.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono uppercase bg-gray-100 px-2 py-1 border border-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-purple-50 border-2 border-purple-500 px-6 py-2">
                  <p className="text-[10px] font-mono text-purple-600 uppercase font-bold">
                    Category
                  </p>
                  <p className="font-sans font-black uppercase">
                    {game.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <Info className="w-5 h-5" />
                  <h3 className="font-sans font-bold uppercase tracking-widest text-sm">
                    About Game
                  </h3>
                </div>
                <p className="font-mono text-sm text-gray-600 leading-relaxed">
                  {game.description}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <Gamepad className="w-5 h-5" />
                  <h3 className="font-sans font-bold uppercase tracking-widest text-sm">
                    Controls
                  </h3>
                </div>
                <ul className="grid grid-cols-1 gap-2">
                  {game.controls.map((control, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 font-mono text-xs"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-black text-white font-bold">
                        {idx + 1}
                      </span>
                      {control}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Related */}
        <div className="space-y-8">
          <div className="bg-purple-600 p-6 border-4 border-black border-l-12">
            <h3 className="font-sans font-black uppercase text-white tracking-widest mb-4">
              You Might Like
            </h3>
            <div className="space-y-6">
              {relatedGames.map((g) => (
                <Link
                  href={`/game/${g.id}`}
                  key={g.id}
                  className="block bg-white border-2 border-black p-3 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0"
                >
                  <Image
                    src={g.thumbnail}
                    alt={g.title}
                    className="aspect-video w-full object-cover mb-2 border border-black"
                  />
                  <p className="font-sans font-black uppercase text-xs">
                    {g.title}
                  </p>
                  <p className="font-mono text-[9px] text-gray-500 uppercase">
                    {g.category}
                  </p>
                </Link>
              ))}
              {relatedGames.length === 0 && (
                <p className="text-white/60 font-mono text-xs italic">
                  No related games found in this quadrant.
                </p>
              )}
            </div>
          </div>

          <div className="bg-yellow-400 p-6 border-4 border-black">
            <h3 className="font-sans font-black uppercase text-black mb-4">
              Arcade Stats
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-black/20 pb-2">
                <span>Active Players</span>
                <span className="font-bold">1,204</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-2">
                <span>High Score</span>
                <span className="font-bold underline italic">REX_99</span>
              </div>
              <div className="flex justify-between">
                <span>Release</span>
                <span className="font-bold uppercase">v1.2.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
