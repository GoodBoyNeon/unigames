"use client";

import { useState } from "react";
import { GAMES } from "@/data/games";
import GameCard from "@/components/GameCard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Library as LibraryIcon, Filter } from "lucide-react";
import { Category } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

export default function Library() {
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All",
  );

  const categories: (Category | "All")[] = [
    "All",
    "Action",
    "Puzzle",
    "Arcade",
    "Strategy",
    "Racing",
    "Casual",
  ];

  const filteredGames =
    selectedCategory === "All"
      ? GAMES
      : GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-3 border-4 border-black rotate-3">
            <LibraryIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase">
              The Library
            </h1>
            <p className="font-mono text-sm text-gray-500 uppercase tracking-widest mt-1">
              Our complete digital archives
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase border-2 border-black transition-all ${
                selectedCategory === cat
                  ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] translate-x-0.5 -translate-y-0.5"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavorite={toggleFavorite}
              isFavorite={favorites.includes(game.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border-4 border-black border-dashed bg-gray-50">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            No games found
          </h2>
          <p className="font-mono text-gray-500 mt-2">
            Try selecting a different category in our archives.
          </p>
        </div>
      )}
    </div>
  );
}
