import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import type { Product } from "../../lib/products";
import { useWishlist } from "../../context/WishlistContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const { isWishlisted, toggleWishlist } = useWishlist();

  const [isUpdating, setIsUpdating] = useState(false);

  const saved = isWishlisted(product.id);

  async function handleWishlist() {
    const token = localStorage.getItem("nova_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsUpdating(true);
      await toggleWishlist(product.id);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-neutral-100">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 bg-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={isUpdating}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105 disabled:opacity-50"
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} className={saved ? "fill-black text-black" : ""} />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          {product.category}
        </p>

        <div className="mt-2 flex items-start justify-between gap-4">
          <Link
            to={`/products/${product.slug}`}
            className="font-semibold transition hover:opacity-60"
          >
            {product.name}
          </Link>

          <p className="shrink-0 text-sm font-semibold">
            ₦{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}
