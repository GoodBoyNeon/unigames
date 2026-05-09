import { motion } from "motion/react";
import Link from "next/link";
import { Game } from "../types";
import { Heart, Play } from "lucide-react";
import Image from "next/image";

interface GameCardProps {
  key?: string | number;
  game: Game;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function GameCard({
  game,
  onFavorite,
  isFavorite,
}: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      viewport={{ once: true }}
      className="group relative bg-white border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(147,51,234,1)] transition-all"
    >
      <div className="aspect-video overflow-hidden border-b-4 border-black relative">
        <Image
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link
            href={`/game/${game.id}`}
            className="bg-white text-black border-2 border-black px-4 py-2 font-sans font-black uppercase tracking-tighter flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Now
          </Link>
        </div>
        <button
          onClick={() => onFavorite?.(game.id)}
          className={`absolute top-2 right-2 p-2 border-2 border-black bg-white hover:bg-purple-100 transition-colors ${
            isFavorite ? "text-red-500 fill-red-500" : "text-black"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-4 bg-white">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-sans font-black text-lg tracking-tight uppercase group-hover:text-purple-600 transition-colors">
            {game.title}
          </h3>
          <span className="bg-purple-100 text-purple-700 border border-purple-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase">
            {game.category}
          </span>
        </div>
        <p className="text-gray-600 text-xs font-mono line-clamp-2 leading-relaxed">
          {game.description}
        </p>
      </div>
    </motion.div>
  );
}
