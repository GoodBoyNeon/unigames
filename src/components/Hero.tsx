"use client";

import { motion } from "motion/react";
import { GAMES } from "../data/games";
import GameCard from "../components/GameCard";
import { Play, Sparkles, TrendingUp, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";

export default function Hero() {
  const featuredRef = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);

  useEffect(() => {
    setRecentlyPlayed(JSON.parse(localStorage.getItem("recent") ?? "[]"));
  }, []);

  const featuredGames = GAMES.filter((g) => g.featured);
  const recentGamesData = GAMES.filter((g) =>
    recentlyPlayed.includes(g.id),
  ).sort((a, b) => recentlyPlayed.indexOf(b.id) - recentlyPlayed.indexOf(a.id));

  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-purple-600 border-b-8 border-black">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0,0,0,1) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-4"
        >
          <div className="inline-block bg-white border-4 border-black px-4 py-2 mb-6 -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-purple-600">
              Level Up Your Fun
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-8 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            Pure Indie
            <br />
            Arcade <span className="text-yellow-400">Magic</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/90 font-mono text-sm md:text-base mb-10 leading-relaxed">
            Discover a curated collection of boundary-pushing web games, built
            by independent creators for players who crave something different.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={scrollToFeatured}
              className="bg-white text-black border-4 border-black px-10 py-4 font-black uppercase text-xl hover:bg-yellow-400 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Play Now
            </button>
            <Link
              href={"/library"}
              className="bg-black text-white border-2 border-white px-10 py-4 font-black uppercase text-xl hover:bg-purple-800 transition-colors"
            >
              View Library
            </Link>
          </div>
        </motion.div>

        {/* Animated Background Icons */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-[10%] opacity-20 text-white hidden lg:block"
        >
          <Sparkles size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-20 right-[10%] opacity-20 text-white hidden lg:block"
        >
          <Play size={120} />
        </motion.div>
      </section>

      {/* Featured Grid */}
      <section ref={featuredRef} className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-10 border-l-8 border-purple-600 pl-6">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            Featured Hits
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavorite={toggleFavorite}
              isFavorite={favorites.includes(game.id)}
            />
          ))}
        </div>
      </section>

      {/* Recently Played */}
      {recentGamesData.length > 0 && (
        <section className="bg-black py-16 -skew-y-2 border-y-8 border-yellow-400">
          <div className="max-w-7xl mx-auto px-4 md:px-8 skew-y-2">
            <div className="flex items-center gap-4 mb-10">
              <Clock className="w-8 h-8 text-yellow-400" />
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                Back for More?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentGamesData.slice(0, 4).map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-900 border-2 border-gray-700 p-4 group hover:border-yellow-400 transition-colors"
                >
                  <div className="aspect-square bg-gray-800 mb-4 overflow-hidden relative border-2 border-black">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-white font-sans font-black uppercase text-sm mb-1">
                    {game.title}
                  </h3>
                  <button className="text-yellow-400 font-mono text-[10px] font-bold uppercase underline">
                    Continue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-10 border-l-8 border-black pl-6">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            Browse Categories
          </h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {["Action", "Puzzle", "Arcade", "Strategy", "Racing", "Casual"].map(
            (cat) => (
              <button
                key={cat}
                className="bg-white border-4 border-black px-8 py-3 font-black uppercase hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
              >
                {cat}
              </button>
            ),
          )}
        </div>
      </section>

      {/* All Games Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-10 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            Library
          </h2>
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">
            {GAMES.length} Games Total
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavorite={toggleFavorite}
              isFavorite={favorites.includes(game.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
