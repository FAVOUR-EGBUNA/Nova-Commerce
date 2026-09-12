import { useEffect, useState } from "react";
import {
  Heart,
  LogOut,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../lib/api";
import { useWishlist, type WishlistItem } from "../../context/WishlistContext";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: {
      id: string;
      url: string;
      altText: string | null;
      position: number;
    }[];
  };
};

type Order = {
  id: string;
  reference: string;
  customerName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

type MeResponse = {
  success: boolean;
  data: UserData;
};

type OrdersResponse = {
  success: boolean;
  data: Order[];
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Account() {
  const navigate = useNavigate();

  const { wishlist, wishlistCount, toggleWishlist, refreshWishlist } =
    useWishlist();

  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadAccount() {
      const token = localStorage.getItem("nova_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const [userResponse, ordersResponse] = await Promise.all([
          api.get<MeResponse>("/auth/me", config),
          api.get<OrdersResponse>("/orders/my", config),
        ]);

        setUser(userResponse.data.data);
        setOrders(ordersResponse.data.data);

        localStorage.setItem(
          "nova_user",
          JSON.stringify(userResponse.data.data),
        );

        await refreshWishlist();
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          localStorage.removeItem("nova_token");
          localStorage.removeItem("nova_user");

          navigate("/login", { replace: true });
          return;
        }

        setError("Unable to load your account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, [navigate, refreshWishlist]);

  function handleLogout() {
    localStorage.removeItem("nova_token");
    localStorage.removeItem("nova_user");

    navigate("/login", {
      replace: true,
    });
  }

  async function handleRemoveWishlist(item: WishlistItem) {
    try {
      setRemovingProductId(item.productId);

      await toggleWishlist(item.productId);
    } catch (requestError) {
      console.error("Unable to remove wishlist item:", requestError);
    } finally {
      setRemovingProductId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <p className="text-sm text-neutral-500">Loading your account...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <Package size={32} className="mx-auto text-neutral-400" />

        <h1 className="mt-5 text-2xl font-bold">
          We couldn't load your account
        </h1>

        <p className="mt-3 text-sm text-neutral-500">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              My account
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Hi, {firstName}.
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Manage your NOVA account, orders and saved items.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-fit items-center gap-2 border border-black/15 bg-white px-5 py-3 text-sm font-semibold transition hover:border-black"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_2fr]">
          <aside className="h-fit border border-black/10 bg-white p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
              <User size={24} />
            </div>

            <h2 className="mt-5 text-xl font-bold">{user.name}</h2>

            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
              <Mail size={15} />

              <span className="break-all">{user.email}</span>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 bg-neutral-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck size={14} />
              {user.role}
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
              <Heart size={15} />

              <span>
                {wishlistCount} saved {wishlistCount === 1 ? "item" : "items"}
              </span>
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </aside>

          <div className="space-y-6">
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={22} />

                  <div>
                    <h2 className="text-xl font-bold">Your orders</h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      Track purchases you've made from NOVA.
                    </p>
                  </div>
                </div>

                {orders.length > 0 && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="mt-8 border border-dashed border-black/15 px-6 py-12 text-center">
                  <Package size={30} className="mx-auto text-neutral-300" />

                  <h3 className="mt-4 font-semibold">No orders yet</h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    Your completed orders will appear here.
                  </p>

                  <Link
                    to="/shop"
                    className="mt-6 inline-flex bg-black px-6 py-3 text-sm font-semibold !text-white transition hover:bg-neutral-800"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {orders.map((order) => (
                    <article key={order.id} className="border border-black/10">
                      <div className="flex flex-col gap-4 bg-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Order
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {order.reference}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
                            {formatStatus(order.status)}
                          </span>

                          <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
                            {formatStatus(order.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="space-y-4">
                          {order.items.map((item) => {
                            const image =
                              item.product.images[0]?.url ??
                              "https://placehold.co/300x400?text=NOVA";

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-4"
                              >
                                <Link
                                  to={`/products/${item.product.slug}`}
                                  className="h-20 w-16 shrink-0 overflow-hidden bg-neutral-100"
                                >
                                  <img
                                    src={image}
                                    alt={
                                      item.product.images[0]?.altText ??
                                      item.product.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                </Link>

                                <div className="min-w-0 flex-1">
                                  <Link
                                    to={`/products/${item.product.slug}`}
                                    className="text-sm font-semibold hover:underline"
                                  >
                                    {item.product.name}
                                  </Link>

                                  <p className="mt-1 text-xs text-neutral-500">
                                    Quantity {item.quantity}
                                  </p>
                                </div>

                                <p className="text-sm font-semibold">
                                  ₦
                                  {(
                                    item.unitPrice * item.quantity
                                  ).toLocaleString()}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-black/10 pt-5 text-sm sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-neutral-400">Date</p>

                            <p className="mt-1 font-semibold">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-400">Items</p>

                            <p className="mt-1 font-semibold">
                              {order.items.reduce(
                                (total, item) => total + item.quantity,
                                0,
                              )}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-xs text-neutral-400">Total</p>

                            <p className="mt-1 text-base font-bold">
                              ₦{order.total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Heart size={22} />

                  <div>
                    <h2 className="text-xl font-bold">Saved items</h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      Products you've added to your wishlist.
                    </p>
                  </div>
                </div>

                {wishlistCount > 0 && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </div>

              {wishlist.length === 0 ? (
                <div className="mt-8 border border-dashed border-black/15 px-6 py-12 text-center">
                  <Heart size={30} className="mx-auto text-neutral-300" />

                  <h3 className="mt-4 font-semibold">Nothing saved yet</h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    Tap the heart on any product to save it here.
                  </p>

                  <Link
                    to="/shop"
                    className="mt-6 inline-flex bg-black px-6 py-3 text-sm font-semibold !text-white transition hover:bg-neutral-800"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlist.map((item) => {
                    const product = item.product;

                    const image =
                      product.images[0]?.url ??
                      "https://placehold.co/500x650?text=NOVA";

                    return (
                      <article key={item.id} className="group">
                        <div className="relative overflow-hidden bg-neutral-100">
                          <Link to={`/products/${product.slug}`}>
                            <img
                              src={image}
                              alt={product.images[0]?.altText ?? product.name}
                              className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemoveWishlist(item)}
                            disabled={removingProductId === product.id}
                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white disabled:opacity-50"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                            {product.category.name}
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
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-black/10 bg-white p-6">
                <p className="text-sm font-semibold">Account email</p>

                <p className="mt-2 break-all text-sm text-neutral-500">
                  {user.email}
                </p>
              </div>

              <div className="border border-black/10 bg-white p-6">
                <p className="text-sm font-semibold">Account status</p>

                <p className="mt-2 text-sm font-medium text-green-700">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
