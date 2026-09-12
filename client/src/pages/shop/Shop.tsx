import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../lib/api";
import ProductCard from "../../components/ui/ProductCard";

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

type ProductsResponse = {
  success: boolean;
  data: ApiProduct[];
};

const categories = ["All", "Women", "Men", "Accessories", "Footwear"];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>("/products");
      return response.data.data;
    },
  });

  const products = data ?? [];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category.name === selectedCategory,
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.name.toLowerCase().includes(query),
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, search, sort]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            NOVA Collection
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Shop
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
            Explore contemporary fashion, accessories and footwear curated for
            modern everyday living.
          </p>
        </div>

        <div className="flex flex-col gap-5 border-y border-black/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm transition ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "border border-black/10 bg-white text-neutral-600 hover:border-black"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-[220px] border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="py-20 text-center text-sm text-neutral-500">
            Loading products...
          </div>
        )}

        {isError && (
          <div className="border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
            We could not load the products. Make sure the NOVA backend is
            running on port 5001.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      category: product.category.name,
                      price: product.price,
                      image:
                        product.images[0]?.url ??
                        "https://placehold.co/900x1100?text=NOVA",
                      badge: product.badge ?? undefined,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-semibold">No products found.</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Try another category or search term.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
