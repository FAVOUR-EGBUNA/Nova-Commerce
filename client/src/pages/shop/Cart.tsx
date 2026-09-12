import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const {
    items,
    subtotal,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">
        <h1 className="text-4xl font-black">Your bag is empty</h1>

        <p className="mt-4 text-neutral-500">
          Add something you love from the NOVA collection.
        </p>

        <Link
          to="/shop"
          className="mt-8 bg-black px-7 py-4 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="border-b border-black/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Your selection
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-tight">
          Shopping bag
        </h1>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="grid grid-cols-[110px_1fr] gap-5 border-b border-black/10 pb-8 sm:grid-cols-[150px_1fr]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] h-full w-full object-cover"
              />

              <div className="flex justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {product.category}
                  </p>

                  <Link
                    to={`/products/${product.slug}`}
                    className="mt-2 block text-lg font-semibold"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-2">
                    {'\u20A6'}{product.price.toLocaleString()}
                  </p>

                  <div className="mt-5 flex items-center">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(product.id)}
                      className="flex h-9 w-9 items-center justify-center border border-black/15"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="flex h-9 min-w-10 items-center justify-center border-y border-black/15 px-3 text-sm">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(product.id)}
                      className="flex h-9 w-9 items-center justify-center border border-black/15"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="self-start text-neutral-400 transition hover:text-black"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit bg-white p-7">
          <h2 className="text-xl font-bold">Order summary</h2>

          <div className="mt-6 flex justify-between border-b border-black/10 pb-5 text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-semibold">
              {'\u20A6'}{subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between border-b border-black/10 py-5 text-sm">
            <span className="text-neutral-500">Delivery</span>
            <span className="font-semibold">
              {subtotal >= 100000 ? "Free" : "Calculated at checkout"}
            </span>
          </div>

          <div className="flex justify-between py-6">
            <span className="font-semibold">Estimated total</span>
            <span className="text-xl font-bold">
              {'\u20A6'}{subtotal.toLocaleString()}
            </span>
          </div>

          <Link
            to="/checkout"
            className="block w-full bg-black px-6 py-4 text-center text-sm font-semibold !text-white transition hover:bg-neutral-800"
          >
            Proceed to checkout
          </Link>

          <Link
            to="/shop"
            className="mt-4 block text-center text-sm font-medium underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}




