import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          New season · 2026
        </p>

        <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
          Style that
          <span className="block font-serif italic font-normal">speaks.</span>
        </h1>

        <p className="mt-7 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
          Discover considered pieces for everyday life. Modern essentials,
          statement silhouettes and timeless design, curated by NOVA.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            to="/shop"
            className="flex items-center gap-3 bg-black px-7 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Shop collection
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/shop"
            className="border border-black px-7 py-4 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            Explore arrivals
          </Link>
        </div>

        <div className="mt-14 flex gap-10 border-t border-black/10 pt-7">
          <div>
            <p className="text-2xl font-bold">120+</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
              Curated pieces
            </p>
          </div>

          <div>
            <p className="text-2xl font-bold">Free</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
              Delivery over ?100k
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[500px] overflow-hidden bg-neutral-900 lg:min-h-[650px]">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 via-neutral-900 to-black" />

        <div className="absolute left-8 top-8 z-10">
          <span className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            New collection
          </span>
        </div>

        <div className="absolute bottom-8 left-8 right-8 z-10 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            The Edit 01
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Modern Form</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
            Refined silhouettes designed for movement, confidence and everyday wear.
          </p>
        </div>
      </div>
    </section>
  );
}


