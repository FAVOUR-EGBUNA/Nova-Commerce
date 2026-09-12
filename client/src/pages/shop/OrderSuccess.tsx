import { Check, Package } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

type OrderSuccessState = {
  reference?: string;
  total?: number;
  customerName?: string;
};

export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = location.state as OrderSuccessState | null;

  const reference =
    state?.reference ?? searchParams.get("reference") ?? "NOVA-ORDER";

  const total = state?.total ?? 0;

  const customerName = state?.customerName ?? "Customer";

  const firstName = customerName.split(" ")[0];

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-6 py-20 lg:px-8">
      <div className="w-full text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
          <Check size={38} strokeWidth={2} />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
          Order confirmed
        </p>

        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
          Thank you, {firstName.toUpperCase()}.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-600">
          Your NOVA order has been received successfully. You can view and track
          your order from your account.
        </p>

        <div className="mx-auto mt-10 max-w-lg border border-black/10 bg-white p-6 text-left">
          <div className="flex items-center justify-between gap-6">
            <span className="text-sm text-neutral-500">Order reference</span>

            <span className="text-right text-sm font-bold">{reference}</span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-5">
            <span className="text-sm text-neutral-500">Total</span>

            <span className="text-sm font-bold">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-black px-7 py-4 text-sm font-semibold !text-white transition hover:bg-neutral-800"
          >
            <Package size={17} />
            Continue shopping
          </Link>

          <Link
            to="/account"
            className="inline-flex items-center justify-center border border-black px-7 py-4 text-sm font-semibold text-black transition hover:bg-black hover:!text-white"
          >
            View my account
          </Link>
        </div>
      </div>
    </section>
  );
}
