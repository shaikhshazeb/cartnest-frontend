export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: "sale" | "new" | "hot";
  specs?: Record<string, string>;
}

export const categories = [
  { id: 1, name: "Electronics", icon: "📱", slug: "electronics" },
  { id: 2, name: "Fashion", icon: "👕", slug: "fashion" },
  { id: 3, name: "Home & Kitchen", icon: "🏠", slug: "home-kitchen" },
  { id: 4, name: "Books", icon: "📚", slug: "books" },
  { id: 5, name: "Sports", icon: "⚽", slug: "sports" },
  { id: 6, name: "Beauty", icon: "💄", slug: "beauty" },
  { id: 7, name: "Toys", icon: "🧸", slug: "toys" },
  { id: 8, name: "Automotive", icon: "🚗", slug: "automotive" },
];

// ─── API Integration ───────────────────────────────────────────────
const BASE_URL = "https://cartnest-backend-ukav.onrender.com";

export interface ApiProduct {
  product_id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
}

export async function fetchProductsFromAPI(category?: string): Promise<Product[]> {
  const url = category
    ? `${BASE_URL}/api/products?category=${category}`
    : `${BASE_URL}/api/products`;

  const res = await fetch(url);
  const data = await res.json();

  return data.products.map((p: ApiProduct) => ({
    id: p.product_id,
    title: p.name,
    price: p.price,
    originalPrice: Math.round(p.price * 1.3 * 100) / 100,
    description: p.description,
    category: category || "general",
    image: p.images?.[0] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
    rating: 4.5,
    reviews: 100,
    inStock: p.stock > 0,
  }));
}