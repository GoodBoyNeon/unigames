"use client";

import { motion } from "motion/react";
import { GAMES } from "@/data/games";
import GameCard from "@/components/GameCard";
import { Heart, Ghost } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

export default function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();

  console.log(favorites);

  const favoriteGames =
    GAMES.filter((g) => favorites?.includes(g.id)) ?? ([] as string[]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 min-h-[60vh] space-y-12">
      <div className="flex items-center justify-between border-b-8 border-black pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 p-3 border-4 border-black -rotate-6">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase">
            Your Stash
          </h1>
        </div>
        <p className="font-mono text-sm uppercase tracking-widest text-gray-500">
          {favoriteGames.length} Saved Hits
        </p>
      </div>

      {favoriteGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {favoriteGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavorite={toggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center space-y-6 pt-20"
        >
          <div className="bg-gray-100 p-8 border-4 border-black border-dashed rounded-full">
            <Ghost className="w-20 h-20 text-gray-300" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
              Ghost Town...
            </h2>
            <p className="font-mono text-gray-500 max-w-sm mx-auto">
              You haven&apos;t favorited any games yet. Head back to the arcade
              and start building your collection!
            </p>
          </div>
          <Link
            href="/"
            className="bg-purple-600 text-white border-4 border-black px-10 py-3 font-black uppercase hover:bg-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:shadow-none"
          >
            Find Games
          </Link>
        </motion.div>
      )}
    </div>
  );
}
