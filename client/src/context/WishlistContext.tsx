import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

import { api } from "../lib/api";

type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  badge: string | null;
  active: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    altText: string | null;
    position: number;
  }[];
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
};

type WishlistResponse = {
  success: boolean;
  data: WishlistItem[];
};

type WishlistContextValue = {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<"added" | "removed">;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    const token = localStorage.getItem("nova_token");

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.get<WishlistResponse>("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("nova_token");
        localStorage.removeItem("nova_user");
        setWishlist([]);
      } else {
        console.error("Unable to load wishlist:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  function isWishlisted(productId: string) {
    return wishlist.some((item) => item.productId === productId);
  }

  async function toggleWishlist(
    productId: string,
  ): Promise<"added" | "removed"> {
    const token = localStorage.getItem("nova_token");

    if (!token) {
      throw new Error("AUTH_REQUIRED");
    }

    const alreadySaved = isWishlisted(productId);

    if (alreadySaved) {
      await api.delete(`/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist((current) =>
        current.filter((item) => item.productId !== productId),
      );

      return "removed";
    }

    await api.post(
      `/wishlist/${productId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await refreshWishlist();

    return "added";
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isLoading,
        isWishlisted,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
