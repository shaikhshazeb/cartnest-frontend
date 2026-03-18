import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiZap, FiStar } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import { categories, fetchProductsFromAPI, Product } from "@/data/products";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const features = [
  { icon: FiTruck, title: "Free Shipping", desc: "On orders over ₹500" },
  { icon: FiShield, title: "Secure Payment", desc: "100% protected" },
  { icon: FiRefreshCw, title: "Easy Returns", desc: "30-day policy" },
  { icon: FiHeadphones, title: "24/7 Support", desc: "Dedicated help" },
];

const HomePage = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsFromAPI()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = allProducts.filter(p => p.rating >= 4.5).slice(0, 4);
  const trending = allProducts.filter(p => p.badge === "hot").slice(0, 4);
  const bestSellers = [...allProducts].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="green-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/50 blur-3xl" />
        </div>
        <div className="container py-14 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 text-center md:text-left z-10">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-secondary/20 text-secondary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm border border-secondary/20"
            >
              <FiZap className="w-3 h-3" /> Mega Sale Live Now — Up to 70% Off
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-primary-foreground leading-[1.1] mb-5 tracking-tight">
              Shop Smart,<br />
              <span className="text-secondary">Save Big</span>
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
              Discover amazing deals on thousands of products. Premium quality electronics, fashion, home essentials and more at unbeatable prices.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link to="/products" className="gold-gradient inline-flex items-center gap-2 text-gold-foreground px-7 py-3.5 rounded-xl font-bold text-sm shadow-[var(--shadow-gold)] hover:scale-105 transition-transform duration-200">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products?badge=sale" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-foreground/20 transition-colors backdrop-blur-sm">
                View Deals
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 text-primary-foreground/60 text-xs">
                <FiStar className="w-4 h-4 text-secondary fill-secondary" />
                <span><strong className="text-primary-foreground">4.8</strong> avg rating</span>
              </div>
              <div className="text-primary-foreground/60 text-xs">
                <strong className="text-primary-foreground">50K+</strong> happy customers
              </div>
              <div className="text-primary-foreground/60 text-xs">
                <strong className="text-primary-foreground">10K+</strong> products
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 relative">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop" alt="Shopping" className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto border-2 border-primary-foreground/10" />
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 md:-left-8 bg-card rounded-xl p-3 shadow-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <FiTruck className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-card-foreground">Free Delivery</p>
                    <p className="text-[9px] text-muted-foreground">On ₹500+ orders</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-4 -right-4 md:-right-8 bg-card rounded-xl p-3 shadow-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1,2,3,4,5].map(i => <FiStar key={i} className="w-3 h-3 text-secondary fill-secondary" />)}
                  </div>
                  <span className="text-[10px] font-bold text-card-foreground">2.8K reviews</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b border-border bg-card shadow-sm">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-2">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse our wide selection of categories</p>
          </div>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border hover:border-primary hover:bg-accent transition-all duration-200 group">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary text-center transition-colors">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked top quality items</p>
          </div>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        )}
      </section>

      {/* Promo banner */}
      <section className="container py-6">
        <div className="gold-gradient rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/50 blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-block text-gold-foreground/80 text-xs font-bold uppercase tracking-widest mb-3">Limited Time Offer</span>
            <h3 className="text-3xl md:text-4xl font-black text-gold-foreground mb-3">Flash Sale: Up to 70% Off!</h3>
            <p className="text-gold-foreground/70 mb-6 max-w-md mx-auto">Don't miss out on incredible savings on select electronics, fashion, and home essentials.</p>
            <Link to="/products?badge=sale" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform duration-200 shadow-lg">
              Shop Sale <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">🔥 Trending Now</h2>
            <p className="text-sm text-muted-foreground mt-1">What everyone's buying right now</p>
          </div>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{trending.length > 0 ? trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />) : allProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Best Sellers</h2>
            <p className="text-sm text-muted-foreground mt-1">Our most loved products</p>
          </div>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;