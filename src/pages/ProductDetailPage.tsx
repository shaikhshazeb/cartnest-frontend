import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiStar, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { fetchProductsFromAPI, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsFromAPI().then((products) => {
      const found = products.find((p) => p.id === Number(id)) || null;
      setProduct(found);
      if (found) {
        setRelated(products.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 4));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Link to="/products" className="text-primary mt-4 inline-block hover:underline">Browse products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container pb-12">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border overflow-hidden">
            <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm text-primary font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>
              </div>
            </div>

            <div className="border-t border-b border-border py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">${product.price}</span>
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">{discount}% OFF</span>
              </div>
              <p className="text-xs text-success font-medium mt-1">Inclusive of all taxes</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">−</button>
                <span className="px-4 py-2 text-sm font-medium text-foreground border-x border-border">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">+</button>
              </div>
              <span className={`text-sm font-medium ${product.inStock ? "text-success" : "text-destructive"}`}>
                {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { for (let i = 0; i < qty; i++) addToCart({ id: product.id, title: product.title, price: product.price, image: product.image }); }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                <FiHeart className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: FiTruck, text: "Free Delivery" },
                { icon: FiShield, text: "1 Year Warranty" },
                { icon: FiRefreshCw, text: "30-Day Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {[
              { name: "Sarah M.", rating: 5, text: "Absolutely love this product! Exceeded my expectations.", date: "2 days ago" },
              { name: "James K.", rating: 4, text: "Very good product for the price. Would recommend to others.", date: "1 week ago" },
              { name: "Emily R.", rating: 5, text: "Perfect! Exactly as described. Will definitely buy again.", date: "2 weeks ago" },
            ].map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{review.name[0]}</div>
                    <span className="font-medium text-sm text-foreground">{review.name}</span>
                    <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <FiStar key={j} className="w-3 h-3 text-warning fill-warning" />)}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;