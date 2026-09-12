import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-black/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="text-2xl font-black tracking-[0.25em]">
            NOVA
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Contemporary fashion and lifestyle essentials curated for modern
            everyday living.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Shop</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
            <Link to="/shop">All products</Link>
            <Link to="/shop">New arrivals</Link>
            <Link to="/shop">Collections</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Account</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
            <Link to="/account">My account</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 NOVA Commerce.</p>
          <p>Built as a full-stack portfolio project.</p>
        </div>
      </div>
    </footer>
  );
}


