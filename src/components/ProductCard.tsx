import { Link } from "react-router-dom";
import { FiShoppingCart, FiHeart, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/data/products";

const badgeStyles = {
  sale: "bg-destructive text-destructive-foreground",
  new: "bg-primary text-primary-foreground",
  hot: "bg-secondary text-secondary-foreground",
};

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-card rounded-xl border border-border overflow-hidden hover-lift"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.title}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${badgeStyles[product.badge]}`}>
            {product.badge === "sale" ? `${discount}% OFF` : product.badge}
          </span>
        )}
        {/* Heart button — always visible */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm ${wishlisted ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
        >
          <FiHeart className={`w-4 h-4 ${wishlisted ? "fill-destructive" : ""}`} />
        </button>
      </div>

      <div className="p-3.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-1.5 hover:text-primary transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-card-foreground">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through ml-1.5">₹{product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, image: product.image })}
            className="w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-sm"
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;