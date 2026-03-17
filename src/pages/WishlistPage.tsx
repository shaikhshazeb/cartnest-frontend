import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          My Wishlist ({items.length} items)
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love by clicking the heart icon.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm">
              <FiArrowLeft /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="relative">
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.title} className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300" />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-destructive hover:scale-110 transition-all shadow-sm"
                    >
                      <FiHeart className="w-4 h-4 fill-destructive" />
                    </button>
                  </div>

                  <div className="p-3.5">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-lg font-black text-foreground mb-3">₹{item.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addToCart({ id: item.id, title: item.title, price: item.price, image: item.image });
                          removeFromWishlist(item.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 border border-border rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;