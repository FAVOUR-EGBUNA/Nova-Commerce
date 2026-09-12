import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

type ApiProduct = {
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

type ProductResponse = {
  success: boolean;
  data: ApiProduct;
};

const sizes = ["XS", "S", "M", "L", "XL"];

export default function ProductDetails() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("M");

  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", slug],
    enabled: Boolean(slug),

    queryFn: async () => {
      const response = await api.get<ProductResponse>(`/products/${slug}`);

      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-neutral-500 lg:px-8">
        Loading product...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <h1 className="text-3xl font-black">Product not found</h1>

        <Link
          to="/shop"
          className="mt-6 inline-block border border-black px-6 py-3 text-sm font-semibold"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const currentProduct = product;

  const image =
    currentProduct.images[0]?.url ?? "https://placehold.co/900x1100?text=NOVA";

  const saved = isWishlisted(currentProduct.id);

  function handleAddToCart() {
    addToCart({
      id: currentProduct.id,
      slug: currentProduct.slug,
      name: currentProduct.name,
      category: currentProduct.category.name,
      price: currentProduct.price,
      image,
      badge: currentProduct.badge ?? undefined,
    });
  }

  async function handleWishlist() {
    const token = localStorage.getItem("nova_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsUpdatingWishlist(true);

      await toggleWishlist(currentProduct.id);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setIsUpdatingWishlist(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="overflow-hidden bg-neutral-100">
          <img
            src={image}
            alt={currentProduct.images[0]?.altText ?? currentProduct.name}
            className="h-full max-h-[760px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            {currentProduct.category.name}
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {currentProduct.name}
          </h1>

          <p className="mt-5 text-2xl font-semibold">
            ₦{currentProduct.price.toLocaleString()}
          </p>

          <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-600">
            {currentProduct.description}
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Select size</p>

              <p className="text-xs text-neutral-500">
                {currentProduct.stock} in stock
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-11 min-w-12 items-center justify-center border px-4 text-sm transition ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-black/15 bg-white hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={currentProduct.stock < 1}
              className="flex flex-1 items-center justify-center gap-2 bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <ShoppingBag size={18} />

              {currentProduct.stock > 0 ? "Add to cart" : "Out of stock"}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              disabled={isUpdatingWishlist}
              className={`flex h-[52px] w-[52px] items-center justify-center border transition disabled:opacity-50 ${
                saved
                  ? "border-black bg-black text-white"
                  : "border-black/15 bg-white text-black hover:border-black"
              }`}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={19}
                className={saved ? "fill-white text-white" : ""}
              />
            </button>
          </div>

          <div className="mt-10 divide-y divide-black/10 border-y border-black/10 text-sm">
            <div className="py-5">
              <p className="font-semibold">Delivery</p>

              <p className="mt-1 text-neutral-500">
                Standard delivery across supported locations.
              </p>
            </div>

            <div className="py-5">
              <p className="font-semibold">Returns</p>

              <p className="mt-1 text-neutral-500">
                Eligible items can be returned according to our return policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
