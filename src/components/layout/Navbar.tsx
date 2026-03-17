import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="green-gradient text-primary-foreground text-xs py-2">
        <div className="container flex justify-between items-center">
          <span className="flex items-center gap-1.5">🚚 Free shipping on orders over $50</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/products" className="hover:text-secondary transition-colors">Sell on CartNest</Link>
            <Link to="/account/orders" className="hover:text-secondary transition-colors">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-card shadow-[var(--shadow-nav)] border-b border-border">
        <div className="container flex items-center gap-4 h-16 md:h-[4.5rem]">
          <Link to="/" className="flex-shrink-0 flex items-center gap-0.5">
            <span className="text-primary text-2xl md:text-3xl font-black tracking-tight">Cart</span>
            <span className="text-secondary text-2xl md:text-3xl font-black tracking-tight">Nest</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="flex w-full rounded-xl overflow-hidden border-2 border-primary/20 focus-within:border-primary transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, and more..."
                className="flex-1 px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground border-0 outline-none"
              />
              <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to={user?.role === "ADMIN" ? "/admin" : "/account"}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-accent"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden lg:inline font-medium">Hi, {user?.username}</span>
                </Link>
                <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted">
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-accent">
                <FiUser className="w-5 h-5" />
                <span className="hidden lg:inline font-medium">Login</span>
              </Link>
            )}

            {/* Wishlist icon with count */}
            <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent hidden md:block">
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart icon with count */}
            <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent">
              <FiShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground p-2">
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Category bar */}
      <div className="bg-card border-b border-border hidden md:block">
        <div className="container flex items-center gap-6 h-10 text-sm">
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <button className="flex items-center gap-1.5 font-semibold text-primary hover:text-primary/80 transition-colors">
              <FiMenu className="w-4 h-4" /> All Categories <FiChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 bg-card border border-border rounded-xl shadow-xl py-2 w-56 z-50"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground"
                      onClick={() => setCatOpen(false)}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors font-medium">All Products</Link>
          <Link to="/products?category=electronics" className="text-muted-foreground hover:text-primary transition-colors font-medium">Electronics</Link>
          <Link to="/products?category=fashion" className="text-muted-foreground hover:text-primary transition-colors font-medium">Fashion</Link>
          <Link to="/products?category=home-kitchen" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home & Kitchen</Link>
          <Link to="/products?badge=sale" className="text-secondary font-bold flex items-center gap-1">🔥 Deals</Link>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container py-4 space-y-3">
              <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border-2 border-primary/20">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2.5 text-sm bg-background border-0 outline-none"
                />
                <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground">
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors" onClick={() => setMobileOpen(false)}>
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      <FiUser /> My Account
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      <FiHeart /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive font-medium">
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                    <FiUser /> Login / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;