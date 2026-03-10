import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart ({items.length} items)</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <FiShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm">
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item.id} layout exit={{ opacity: 0, x: -50 }} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.title} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`} className="font-medium text-sm text-card-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </Link>
                      <p className="text-lg font-bold text-foreground mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border rounded">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors"><FiMinus className="w-3 h-3" /></button>
                          <span className="px-3 text-sm font-medium text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors"><FiPlus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 transition-colors p-1">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex justify-between pt-2">
                <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1"><FiArrowLeft className="w-3 h-3" /> Continue Shopping</Link>
                <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear Cart</button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-32">
              <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success">Free</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax (est.)</span><span>${(totalPrice * 0.08).toFixed(2)}</span></div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-lg">
                  <span>Total</span><span>${(totalPrice * 1.08).toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
