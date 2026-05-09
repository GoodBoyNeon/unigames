import { StaticImageData } from "next/image";
import { ComponentType } from "react";

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: StaticImageData;
  category: string;
  featured: boolean;
  controls: string[];
  tags: string[];
  component: ComponentType;
}

export type Category =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Strategy"
  | "Racing"
  | "Casual";
