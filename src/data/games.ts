import GalaxyDefendPNG from "@/assets/galaxy-defend.png";
import SnakePNG from "@/assets/snake.png";
import { Game } from "../types";
import dynamic from "next/dynamic";

export const GAMES: Game[] = [
  {
    id: "galaxy-defend",
    title: "Galaxy Defend",
    description:
      "Classic space shooter reimagined with modern graphics. Protect your planet from waves of relentless alien invaders.",
    thumbnail: GalaxyDefendPNG,
    category: "Action",
    featured: true,
    controls: ["Arrow Keys to Move", "Space to Shoot", "X for Special"],
    tags: ["Shooter", "Action", "Retro"],
    component: dynamic(() => import("@/games/GalaxyDefend")),
  },
  {
    id: "snake",
    title: "Snake Game",
    description:
      "A simple snake game. Eat food, grow longer, and try not to crash into yourself!",
    thumbnail: SnakePNG,
    category: "Casual",
    featured: true,
    controls: ["HJKL to Move"],
    tags: ["snake-game", "simple", "vim"],
    component: dynamic(() => import("@/games/VimSnake")),
  },
  // {
  //   id: "guessing-game",
  //   title: "Guessing Game",
  //   description:
  //     "A fun guessing game where either you or the computer tries to figure out the hidden word using clues and hints about the subject.",
  //   thumbnail:
  //     "https://images.unsplash.com/photo-1614850523296-e8c041de4398?auto=format&fit=crop&q=80&w=800",
  //   category: "Puzzle",
  //   featured: true,
  //   controls: ["Just type out your hints/guesses"],
  //   tags: ["Mind-bending", "Minimalist", "Relaxing"],
  // },
  // {
  //   id: "pixel-bounce",
  //   title: "Pixel Bounce",
  //   description:
  //     "A cheerful platformer where timing is everything. Jump through vibrant levels and collect all the golden pixels.",
  //   thumbnail:
  //     "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
  //   category: "Arcade",
  //   featured: false,
  //   controls: ["Left/Right to Walk", "Up to Jump", "Shift to Sprint"],
  //   tags: ["Platformer", "Colorful", "Kids"],
  //   embedUrl: "https://poki.com/en/g/super-mario-run",
  // },
  // {
  //   id: "cyber-grid",
  //   title: "Cyber Grid",
  //   description:
  //     "Tactical grid-based strategy game. Lead your digital army to victory in a high-stakes cyber warfare simulation.",
  //   thumbnail:
  //     "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
  //   category: "Strategy",
  //   featured: false,
  //   controls: ["Click to Select Unit", "Drag to Move", "Enter to End Turn"],
  //   tags: ["Tactical", "Cyberpunk", "Strategy"],
  //   embedUrl: "https://poki.com/en/g/clash-of-armour",
  // },
  // {
  //   id: "aqua-drift",
  //   title: "Aqua Drift",
  //   description:
  //     "High-octane water racing. Master the waves and drift around tight corners in this stylized summer adventure.",
  //   thumbnail:
  //     "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&q=80&w=800",
  //   category: "Racing",
  //   featured: false,
  //   controls: ["WASD to Steer", "Shift to Drift", "Space for Turbo"],
  //   tags: ["Water", "Drifting", "Summer"],
  //   embedUrl: "https://poki.com/en/g/row-row",
  // },
];
