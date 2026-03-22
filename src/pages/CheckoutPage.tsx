import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const BASE_URL = "https://cartnest-backend-ukav.onrender.com";
const RAZORPAY_KEY_ID = "rzp_test_LqWBBDbgwot5lh"; // Replace with new key after regenerating

declare global { 
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });

  const totalWithTax = totalPrice * 1.08;

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Create order on backend
      const res = await fetch(`${BASE_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          totalAmount: totalWithTax.toFixed(2),
        }),
      });

      const razorpayOrderId = await res.text();

      if (!res.ok) {
        toast.error("Failed to create order");
        setLoading(false);
        return;
      }

      // Step 2 — Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(totalWithTax * 100),
        currency: "INR",
        name: "CartNest",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: form.name || user.username,
          email: form.email || user.email,
          contact: form.phone,
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          // Step 3 — Verify payment on backend
          try {
            const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: user.username,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success("Payment successful! 🎉 Order placed.");
              clearCart();
              navigate("/");
            } else {
              toast.error("Payment verification failed");
            }
          } catch {
            toast.error("Payment verification error");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.city || !form.zip) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (paymentMethod === "online") {
      handleRazorpayPayment();
    } else {
      // COD
      toast.success("Order placed successfully! 🎉");
      clearCart();
      navigate("/");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Link to="/products" className="text-primary hover:underline">Continue shopping</Link>
        </div>
      <Footer /></div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>
        {!isAuthenticated && (
          <div className="bg-accent border border-border rounded-lg p-4 mb-6 text-sm">
            <Link to="/login" className="text-primary font-medium hover:underline">Login</Link> for a faster checkout experience.
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-foreground mb-4">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "city", label: "City", type: "text" },
                  { key: "zip", label: "ZIP Code", type: "text" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "online", label: "Online Payment", desc: "Credit/Debit Card, UPI, NetBanking via Razorpay" },
                  { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                ].map((m) => (
                  <label key={m.value} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === m.value ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}>
                    <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-32">
            <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-success">Free</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax (8%)</span><span>₹{(totalPrice * 0.08).toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-lg">
                <span>Total</span><span>₹{totalWithTax.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <FiLock className="w-4 h-4" />
              {loading ? "Processing..." : paymentMethod === "online" ? "Pay with Razorpay" : "Place Order"}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">🔒 Your payment information is secure</p>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;