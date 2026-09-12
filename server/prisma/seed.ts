import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Structured Black Blazer",
    slug: "structured-black-blazer",
    category: "Women",
    categorySlug: "women",
    price: 78500,
    stock: 18,
    badge: "New",
    description:
      "A sharp structured blazer designed for effortless day-to-night styling.",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Minimal Cream Shirt",
    slug: "minimal-cream-shirt",
    category: "Women",
    categorySlug: "women",
    price: 42500,
    stock: 24,
    badge: "Popular",
    description:
      "A clean cream shirt with a relaxed silhouette for modern everyday dressing.",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Classic Cotton Tee",
    slug: "classic-cotton-tee",
    category: "Men",
    categorySlug: "men",
    price: 28500,
    stock: 35,
    description:
      "A premium cotton essential built for comfort, layering and everyday wear.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Relaxed Neutral Trousers",
    slug: "relaxed-neutral-trousers",
    category: "Men",
    categorySlug: "men",
    price: 54500,
    stock: 16,
    badge: "New",
    description:
      "Relaxed tailored trousers balancing clean structure with all-day comfort.",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Leather Shoulder Bag",
    slug: "leather-shoulder-bag",
    category: "Accessories",
    categorySlug: "accessories",
    price: 69000,
    stock: 12,
    badge: "Bestseller",
    description:
      "A refined shoulder bag with a timeless silhouette and everyday functionality.",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Minimalist Watch",
    slug: "minimalist-watch",
    category: "Accessories",
    categorySlug: "accessories",
    price: 49500,
    stock: 20,
    description:
      "A minimal everyday watch designed with a clean face and understated finish.",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Essential White Sneakers",
    slug: "essential-white-sneakers",
    category: "Footwear",
    categorySlug: "footwear",
    price: 65500,
    stock: 22,
    badge: "Popular",
    description:
      "Versatile white sneakers designed to complement casual and elevated looks.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Everyday Runner",
    slug: "everyday-runner",
    category: "Footwear",
    categorySlug: "footwear",
    price: 72000,
    stock: 14,
    badge: "New",
    description:
      "A lightweight everyday runner combining comfort, performance and contemporary style.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
];

async function main() {
  const categories = ["Women", "Men", "Accessories", "Footwear"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: {
        slug: name.toLowerCase(),
      },
      update: {
        name,
      },
      create: {
        name,
        slug: name.toLowerCase(),
      },
    });
  }

  for (const item of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: {
        slug: item.categorySlug,
      },
    });

    await prisma.product.upsert({
      where: {
        slug: item.slug,
      },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        badge: item.badge ?? null,
        active: true,
        categoryId: category.id,
        images: {
          deleteMany: {},
          create: {
            url: item.image,
            altText: item.name,
            position: 0,
          },
        },
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        stock: item.stock,
        badge: item.badge ?? null,
        active: true,
        categoryId: category.id,
        images: {
          create: {
            url: item.image,
            altText: item.name,
            position: 0,
          },
        },
      },
    });
  }

  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();

  console.log(`Seed complete: ${categoryCount} categories, ${productCount} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
