import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `transition hover:opacity-60 ${
      isActive ? "font-semibold text-black" : "text-neutral-600"
    }`;

  function handleSearch() {
    navigate("/shop?search=");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f8f7f3]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-[0.25em]"
          aria-label="NOVA Home"
        >
          NOVA
        </Link>

        {/* Main navigation */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>

          <Link
            to="/shop"
            className="text-neutral-600 transition hover:opacity-60"
          >
            New Arrivals
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
            aria-label="Search products"
            title="Search products"
          >
            <Search size={19} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 sm:flex"
            aria-label={`Saved items${
              wishlistCount > 0 ? ` (${wishlistCount})` : ""
            }`}
            title="Saved items"
          >
            <Heart
              size={19}
              className={wishlistCount > 0 ? "fill-black" : ""}
            />

            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 sm:flex"
            aria-label="Account"
            title="Account"
          >
            <User size={19} />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount})` : ""}`}
            title="Cart"
          >
            <ShoppingBag size={19} />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
