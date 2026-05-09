import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];

    setFavorites(updated);
  };

  return {
    favorites,
    toggleFavorite,
  };
}
