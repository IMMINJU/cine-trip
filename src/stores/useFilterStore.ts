import { create } from "zustand";
import type { CinemaBrand, SortOption } from "@/types";

interface FilterState {
  selectedBrand: CinemaBrand | null;
  sortOption: SortOption;
  showFavoritesOnly: boolean;
  searchQuery: string;
  setSelectedBrand: (brand: CinemaBrand | null) => void;
  setSortOption: (option: SortOption) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedBrand: null,
  sortOption: "latest",
  showFavoritesOnly: false,
  searchQuery: "",
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setSortOption: (option) => set({ sortOption: option }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set({ selectedBrand: null, sortOption: "latest", showFavoritesOnly: false, searchQuery: "" }),
}));
