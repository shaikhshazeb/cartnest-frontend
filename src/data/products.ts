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

export const products: Product[] = [
  {
    id: 1, title: "Wireless Noise Cancelling Headphones", price: 79.99, originalPrice: 149.99,
    description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for music lovers and professionals.",
    category: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4.5, reviews: 2847, inStock: true, badge: "sale",
    specs: { "Battery Life": "30 hours", "Connectivity": "Bluetooth 5.2", "Driver Size": "40mm", "Weight": "250g" },
  },
  {
    id: 2, title: "Smart Watch Pro Max", price: 299.99, originalPrice: 399.99,
    description: "Advanced smartwatch with health monitoring, GPS tracking, and a stunning AMOLED display. Water resistant up to 50 meters.",
    category: "electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    rating: 4.7, reviews: 1523, inStock: true, badge: "hot",
    specs: { "Display": "1.9\" AMOLED", "Battery": "7 days", "Water Resistance": "50m", "Sensors": "Heart rate, SpO2, GPS" },
  },
  {
    id: 3, title: "Premium Cotton Crew T-Shirt", price: 24.99, originalPrice: 39.99,
    description: "Ultra-soft 100% organic cotton t-shirt with a modern fit. Available in multiple colors.",
    category: "fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    rating: 4.3, reviews: 892, inStock: true, badge: "new",
    specs: { "Material": "100% Organic Cotton", "Fit": "Regular", "Care": "Machine Washable" },
  },
  {
    id: 4, title: "Stainless Steel Water Bottle 1L", price: 19.99, originalPrice: 29.99,
    description: "Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
    category: "sports", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    rating: 4.6, reviews: 3421, inStock: true, badge: "sale",
  },
  {
    id: 5, title: "Professional Camera Lens Kit", price: 449.99, originalPrice: 599.99,
    description: "Complete lens kit with wide-angle, telephoto, and macro lenses for professional photography.",
    category: "electronics", image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&h=400&fit=crop",
    rating: 4.8, reviews: 567, inStock: true,
    specs: { "Lenses": "3 included", "Mount": "Universal", "Coating": "Multi-layer" },
  },
  {
    id: 6, title: "Ergonomic Office Chair", price: 349.99, originalPrice: 499.99,
    description: "Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back.",
    category: "home-kitchen", image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop",
    rating: 4.4, reviews: 1245, inStock: true, badge: "hot",
  },
  {
    id: 7, title: "Organic Face Serum Set", price: 34.99, originalPrice: 54.99,
    description: "Set of 3 organic face serums for hydration, brightening, and anti-aging. Suitable for all skin types.",
    category: "beauty", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    rating: 4.2, reviews: 678, inStock: true, badge: "new",
  },
  {
    id: 8, title: "Bestselling Novel Collection", price: 29.99, originalPrice: 49.99,
    description: "Collection of 5 bestselling novels from top authors. Perfect gift for book lovers.",
    category: "books", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    rating: 4.9, reviews: 2103, inStock: true,
  },
  {
    id: 9, title: "Wireless Bluetooth Speaker", price: 59.99, originalPrice: 89.99,
    description: "Portable Bluetooth speaker with 360° sound, waterproof design, and 20-hour battery life.",
    category: "electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    rating: 4.5, reviews: 1876, inStock: true, badge: "sale",
  },
  {
    id: 10, title: "Running Shoes Ultra Boost", price: 129.99, originalPrice: 179.99,
    description: "Lightweight running shoes with responsive cushioning and breathable knit upper.",
    category: "sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.6, reviews: 2341, inStock: true, badge: "hot",
  },
  {
    id: 11, title: "Ceramic Non-Stick Cookware Set", price: 89.99, originalPrice: 139.99,
    description: "10-piece ceramic non-stick cookware set. PFOA-free and dishwasher safe.",
    category: "home-kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    rating: 4.3, reviews: 945, inStock: true,
  },
  {
    id: 12, title: "Mechanical Gaming Keyboard", price: 69.99, originalPrice: 109.99,
    description: "RGB mechanical keyboard with cherry MX switches, macro keys, and aluminum body.",
    category: "electronics", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop",
    rating: 4.7, reviews: 1654, inStock: true, badge: "sale",
  },
  {
    id: 13, title: "Leather Crossbody Bag", price: 49.99, originalPrice: 79.99,
    description: "Genuine leather crossbody bag with multiple compartments and adjustable strap.",
    category: "fashion", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    rating: 4.4, reviews: 732, inStock: true, badge: "new",
  },
  {
    id: 14, title: "Smart Home Hub Controller", price: 99.99, originalPrice: 149.99,
    description: "Central hub to control all your smart home devices. Compatible with Alexa and Google Home.",
    category: "electronics", image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop",
    rating: 4.1, reviews: 423, inStock: true,
  },
  {
    id: 15, title: "Yoga Mat Premium", price: 39.99, originalPrice: 59.99,
    description: "Extra-thick premium yoga mat with non-slip surface and carrying strap.",
    category: "sports", image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop",
    rating: 4.5, reviews: 1123, inStock: true,
  },
  {
    id: 16, title: "Vintage Sunglasses Collection", price: 44.99, originalPrice: 69.99,
    description: "Retro-inspired sunglasses with UV400 protection and polarized lenses.",
    category: "fashion", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    rating: 4.3, reviews: 567, inStock: true, badge: "hot",
  },
];

export const getProductsByCategory = (cat: string) => products.filter((p) => p.category === cat);
export const getFeaturedProducts = () => products.filter((p) => p.rating >= 4.5);
export const getTrendingProducts = () => products.filter((p) => p.badge === "hot");
export const getBestSellers = () => products.sort((a, b) => b.reviews - a.reviews).slice(0, 8);
export const getProductById = (id: number) => products.find((p) => p.id === id);
