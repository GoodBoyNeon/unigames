export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  featured: boolean;
  controls: string[];
  tags: string[];
  embedUrl: string;
}

export type Category =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Strategy"
  | "Racing"
  | "Casual";
