"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  wishlist: number[];
  toggleWishlist: (auctionId: number) => void;
  isWishlisted: (auctionId: number) => boolean;
  syncWithServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      toggleWishlist: (auctionId: number) => {
        const current = get().wishlist;
        if (current.includes(auctionId)) {
          set({ wishlist: current.filter((id) => id !== auctionId) });
        } else {
          set({ wishlist: [...current, auctionId] });
        }
      },

      isWishlisted: (auctionId: number) => {
        return get().wishlist.includes(auctionId);
      },

      // stub: 백엔드 API 준비 후 활성화
      syncWithServer: async () => {
        // TODO: API 연동
        // const serverWishlist = await apiClient<number[]>('/api/v1/wishlist');
        // set({ wishlist: serverWishlist });
      },
    }),
    {
      name: "eolma-wishlist",
    },
  ),
);
