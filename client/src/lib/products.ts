export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "structured-black-blazer",
    name: "Structured Black Blazer",
    category: "Women",
    price: 78500,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
    badge: "New",
  },
  {
    id: "2",
    slug: "minimal-cream-shirt",
    name: "Minimal Cream Shirt",
    category: "Women",
    price: 42500,
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    slug: "classic-cotton-tee",
    name: "Classic Cotton Tee",
    category: "Men",
    price: 28500,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    badge: "Bestseller",
  },
  {
    id: "4",
    slug: "relaxed-neutral-trousers",
    name: "Relaxed Neutral Trousers",
    category: "Men",
    price: 54500,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "5",
    slug: "leather-shoulder-bag",
    name: "Leather Shoulder Bag",
    category: "Accessories",
    price: 69000,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    badge: "New",
  },
  {
    id: "6",
    slug: "minimalist-watch",
    name: "Minimalist Watch",
    category: "Accessories",
    price: 49500,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "7",
    slug: "essential-white-sneakers",
    name: "Essential White Sneakers",
    category: "Footwear",
    price: 65500,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "8",
    slug: "everyday-runner",
    name: "Everyday Runner",
    category: "Footwear",
    price: 72000,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  },
];
