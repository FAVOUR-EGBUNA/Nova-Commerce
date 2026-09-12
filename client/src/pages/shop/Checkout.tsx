import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../lib/api";
import { useCart } from "../../context/CartContext";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Enter your first name"),
  lastName: z.string().min(2, "Enter your last name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(5, "Enter a valid phone number"),
  address: z.string().min(5, "Enter your delivery address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  postalCode: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type OrderResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    reference: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: string;
    paymentStatus: string;
  };
};

export default function Checkout() {
  const navigate = useNavigate();

  const { items, subtotal, clearCart } = useCart();

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = subtotal >= 100000 ? 0 : 5000;
  const total = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  async function onSubmit(values: CheckoutValues) {
    try {
      setServerError("");
      setIsSubmitting(true);

      const token = localStorage.getItem("nova_token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await api.post<OrderResponse>(
        "/orders",
        {
          customerName: `${values.firstName} ${values.lastName}`,
          customerEmail: values.email,
          customerPhone: values.phone,
          shippingAddress: values.address,
          shippingCity: values.city,
          shippingState: values.state,
          shippingPostal: values.postalCode || undefined,

          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const order = response.data.data;

      clearCart();

      navigate(
        `/order-success?reference=${encodeURIComponent(order.reference)}`,
        {
          state: {
            reference: order.reference,
            total: order.total,
            customerName: `${values.firstName} ${values.lastName}`,
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("nova_token");
          localStorage.removeItem("nova_user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setServerError(
          error.response?.data?.message ?? "Unable to complete your order",
        );
      } else {
        setServerError("Unable to complete your order");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <h1 className="text-3xl font-black">Your cart is empty</h1>

        <p className="mt-3 text-sm text-neutral-500">
          Add something to your cart before checking out.
        </p>

        <Link
          to="/shop"
          className="mt-7 inline-block bg-black px-6 py-3 text-sm font-semibold !text-white"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Secure checkout
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Checkout
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-500">
          Enter your delivery information and review your order before placing
          it.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border border-black/10 bg-white p-6 sm:p-8"
        >
          <h2 className="text-xl font-bold">Delivery information</h2>

          {serverError && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                First name
              </label>

              <input
                {...register("firstName")}
                type="text"
                className="input"
                placeholder="First name"
              />

              {errors.firstName && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Last name
              </label>

              <input
                {...register("lastName")}
                type="text"
                className="input"
                placeholder="Last name"
              />

              {errors.lastName && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Email</label>

              <input
                {...register("email")}
                type="email"
                className="input"
                placeholder="you@example.com"
              />

              {errors.email && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Phone number
              </label>

              <input
                {...register("phone")}
                type="tel"
                className="input"
                placeholder="+234..."
              />

              {errors.phone && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Delivery address
              </label>

              <input
                {...register("address")}
                type="text"
                className="input"
                placeholder="Street address"
              />

              {errors.address && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">City</label>

              <input
                {...register("city")}
                type="text"
                className="input"
                placeholder="City"
              />

              {errors.city && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">State</label>

              <input
                {...register("state")}
                type="text"
                className="input"
                placeholder="State"
              />

              {errors.state && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Postal code
                <span className="ml-1 font-normal text-neutral-400">
                  optional
                </span>
              </label>

              <input
                {...register("postalCode")}
                type="text"
                className="input"
                placeholder="Postal code"
              />
            </div>
          </div>

          <div className="mt-8 border border-black/10 bg-neutral-50 p-5">
            <p className="text-sm font-semibold">Demo payment</p>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              NOVA currently uses a simulated payment workflow for portfolio
              demonstration. No real card will be charged.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Placing order..."
              : `Place order · ₦${total.toLocaleString()}`}
          </button>
        </form>

        <aside className="h-fit border border-black/10 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold">Order summary</h2>

          <div className="mt-6 space-y-5">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.product.name}</p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    ₦{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-black/10 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>

              <span>₦{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery</span>

              <span>
                {deliveryFee === 0
                  ? "Free"
                  : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-4 text-base font-bold">
              <span>Total</span>

              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          <Link
            to="/cart"
            className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-black"
          >
            ← Return to cart
          </Link>
        </aside>
      </div>
    </section>
  );
}
