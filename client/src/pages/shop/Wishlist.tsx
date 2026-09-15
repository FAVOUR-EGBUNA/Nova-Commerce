import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import PageLoader from "../../components/ui/PageLoader";

export default function Wishlist() {
  const navigate = useNavigate();

  const { wishlist, wishlistCount, isLoading, toggleWishlist } = useWishlist();

  const { addToCart } = useCart();

  const token = localStorage.getItem("nova_token");

  async function handleRemove(productId: string) {
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error("Remove wishlist item error:", error);
    }
  }

  function handleAddToCart(item: (typeof wishlist)[number]) {
    addToCart({
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      category: item.product.category.name,
      price: item.product.price,
      image:
        item.product.images[0]?.url ??
        "https://placehold.co/900x1100?text=NOVA",
      badge: item.product.badge ?? undefined,
    });
  }

  if (!token) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-6 py-20 lg:px-8">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
            <Heart size={26} />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Sign in to view saved items
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Save the NOVA pieces you love and come back to them anytime.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 bg-black px-7 py-3.5 text-sm font-semibold !text-white"
          >
            Sign in
          </button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <PageLoader message="Loading saved items..." fullPage />;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="border-b border-black/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Your favourites
        </p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Saved items
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
            </p>
          </div>

          <Link
            to="/shop"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex min-h-[430px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/10">
              <Heart size={26} />
            </div>

            <h2 className="mt-6 text-2xl font-black">Nothing saved yet</h2>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Tap the heart on any product to save it here for later.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex bg-black px-7 py-3.5 text-sm font-semibold !text-white"
            >
              Explore collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => {
            const image =
              item.product.images[0]?.url ??
              "https://placehold.co/900x1100?text=NOVA";

            return (
              <article key={item.id} className="group">
                <div className="relative overflow-hidden bg-neutral-100">
                  <Link to={`/products/${item.product.slug}`}>
                    <img
                      src={image}
                      alt={item.product.images[0]?.altText ?? item.product.name}
                      className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black hover:text-white"
                    aria-label={`Remove ${item.product.name} from saved items`}
                  >
                    <Trash2 size={17} />
                  </button>

                  {item.product.badge && (
                    <span className="absolute left-3 top-3 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                      {item.product.badge}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    {item.product.category.name}
                  </p>

                  <Link
                    to={`/products/${item.product.slug}`}
                    className="mt-1 block text-base font-semibold transition hover:opacity-60"
                  >
                    {item.product.name}
                  </Link>

                  <p className="mt-2 font-semibold">
                    ₦{item.product.price.toLocaleString()}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.product.stock <= 0}
                      className="flex items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-semibold !text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ShoppingBag size={16} />

                      {item.product.stock > 0 ? "Add to bag" : "Sold out"}
                    </button>

                    <Link
                      to={`/products/${item.product.slug}`}
                      className="flex items-center justify-center border border-black/15 px-4 py-3 text-sm font-semibold transition hover:border-black"
                    >
                      View item
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
