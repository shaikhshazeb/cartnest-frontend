import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiShoppingCart, FiTrash2, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
const BASE_URL = "https://cartnest-backend-ukav.onrender.com";

interface OrderProduct {
  order_id: string;
  product_id: number;
  name: string;
  description: string;
  image_url: string;
  status: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

const statusColors: Record<string, string> = {
  SUCCESS: "bg-success/10 text-success",
  PENDING: "bg-warning/10 text-warning",
  FAILED: "bg-destructive/10 text-destructive",
};

const statusSteps = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<OrderProduct[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    dealsOffers: true,
    newArrivals: false,
    newsletter: false,
  });

  const tabs = [
    { icon: FiUser, label: "Profile", id: "profile" },
    { icon: FiPackage, label: "Orders", id: "orders" },
    { icon: FiHeart, label: "Wishlist", id: "wishlist" },
    { icon: FiSettings, label: "Settings", id: "settings" },
  ];

  useEffect(() => {
    if (activeTab === "orders" && user) {
      setOrdersLoading(true);
      fetch(`${BASE_URL}/api/orders?username=${user.username}`)
        .then(res => res.json())
        .then(data => setOrders(data.products || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, user]);

  const groupedOrders = orders.reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {} as Record<string, OrderProduct[]>);

  // Password change handler
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-card border border-border rounded-lg p-4 h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{user?.username?.[0] || "U"}</div>
              <div>
                <p className="font-semibold text-foreground text-sm">{user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(({ icon: Icon, label, id }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${activeTab === id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="w-4 h-4" />{label}
                  {id === "wishlist" && wishlistItems.length > 0 && (
                    <span className="ml-auto text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{wishlistItems.length}</span>
                  )}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/5 transition-colors">
                <FiLogOut className="w-4 h-4" />Logout
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-foreground mb-4">Profile Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <input type="text" defaultValue={user?.username} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground" />
                  </div>
                </div>
                <button className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Save Changes</button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-foreground mb-4">My Orders</h2>
                {ordersLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>
                ) : Object.keys(groupedOrders).length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                    <Link to="/products" className="text-primary text-sm hover:underline mt-2 inline-block">Start shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedOrders).map(([orderId, items]) => {
                      const totalAmount = items.reduce((sum, item) => sum + Number(item.total_price), 0);
                      const isExpanded = expandedOrder === orderId;
                      const status = items[0]?.status;
                      return (
                        <div key={orderId} className="border border-border rounded-lg overflow-hidden">
                          {/* Order header */}
                          <div className="flex items-center justify-between p-4 bg-accent/30 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : orderId)}>
                            <div>
                              <p className="font-semibold text-sm text-foreground">Order: <span className="text-primary text-xs">{orderId.slice(0, 18)}...</span></p>
                              <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length > 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="font-bold text-foreground">₹{totalAmount.toFixed(2)}</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>
                            </div>
                          </div>

                          {/* Order tracking */}
                          {isExpanded && (
                            <div className="p-4 border-t border-border">
                              {/* Tracking steps */}
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Order Tracking</p>
                                <div className="flex items-center justify-between relative">
                                  <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
                                  <div className="absolute top-3 left-0 h-0.5 bg-primary transition-all" style={{ width: status === "SUCCESS" ? "100%" : "25%" }} />
                                  {statusSteps.map((step, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${status === "SUCCESS" || i === 0 ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"}`}>
                                        {status === "SUCCESS" ? <FiCheckCircle className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                      </div>
                                      <span className="text-[9px] text-muted-foreground text-center w-14 leading-tight">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order items */}
                              <div className="divide-y divide-border">
                                {items.map((item, i) => (
                                  <div key={i} className="flex gap-3 py-3">
                                    <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-border" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                        <span className="text-xs text-muted-foreground">₹{item.price_per_unit}/unit</span>
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">₹{Number(item.total_price).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-foreground mb-4">My Wishlist ({wishlistItems.length} items)</h2>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Your wishlist is empty</p>
                    <Link to="/products" className="text-primary text-sm hover:underline mt-2 inline-block">Browse products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 border border-border rounded-lg">
                        <Link to={`/product/${item.id}`}>
                          <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.id}`}>
                            <p className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary">{item.title}</p>
                          </Link>
                          <p className="text-sm font-bold text-foreground mt-1">₹{item.price}</p>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => { addToCart({ id: item.id, title: item.title, price: item.price, image: item.image }); removeFromWishlist(item.id); }}
                              className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:opacity-90">
                              <FiShoppingCart className="w-3 h-3" /> Add to Cart
                            </button>
                            <button onClick={() => removeFromWishlist(item.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* Change Password */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-bold text-foreground mb-1">Change Password</h2>
                  <p className="text-xs text-muted-foreground mb-4">Set a new password for your account</p>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                      )}
                      {confirmPassword && newPassword === confirmPassword && (
                        <p className="text-xs text-success mt-1">Passwords match ✓</p>
                      )}
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={pwdLoading}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {pwdLoading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-bold text-foreground mb-1">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground mb-4">Manage how you receive notifications</p>
                  <div className="space-y-4">
                    {[
                      { key: "orderUpdates", label: "Order Updates", desc: "Get notified about your order status" },
                      { key: "dealsOffers", label: "Deals & Offers", desc: "Receive alerts about sales and discounts" },
                      { key: "newArrivals", label: "New Arrivals", desc: "Be the first to know about new products" },
                      { key: "newsletter", label: "Newsletter", desc: "Weekly newsletter with top picks" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div style={{ position: "relative", width: "44px", height: "24px", flexShrink: 0 }}>
                          <style>{`
                            .ntoggler-input { display: none; }
                            .ntoggler-label { display: block; position: relative; width: 44px; height: 24px; border: 1px solid #d6d6d6; border-radius: 24px; background: #e4e8e8; cursor: pointer; }
                            .ntoggler-label::after { display: block; border-radius: 100%; background-color: #d7062a; content: ''; animation: ntoggler-size 0.15s ease-out forwards; position: absolute; top: 50%; left: 25%; width: 18px; height: 18px; transform: translateY(-50%) translateX(-50%); transition: left 0.15s ease-in-out, background-color 0.2s ease-out, width 0.15s, height 0.15s; }
                            .ntoggler-input:checked + .ntoggler-label::after { left: 75%; background-color: #50ac5d; animation-name: ntoggler-size2; }
                            .ntoggler-svg { position: absolute; top: 50%; left: 25%; width: 18px; height: 18px; transform: translateY(-50%) translateX(-50%); transition: left 0.15s ease-in-out, width 0.15s, height 0.15s, opacity 0.15s; z-index: 2; opacity: 1; }
                            .ntoggler-input:checked + .ntoggler-label .ntoggler-svg { left: 75%; }
                            .ntoggler-input:checked + .ntoggler-label .ntoggler-off { width: 0; height: 0; opacity: 0; }
                            .ntoggler-input:not(:checked) + .ntoggler-label .ntoggler-on { width: 0; height: 0; opacity: 0; }
                            .npath { fill: none; stroke: #fefefe; stroke-width: 7px; stroke-linecap: round; stroke-miterlimit: 10; }
                            @keyframes ntoggler-size { 0%,100% { width: 26px; height: 26px; } 50% { width: 20px; height: 20px; } }
                            @keyframes ntoggler-size2 { 0%,100% { width: 26px; height: 26px; } 50% { width: 20px; height: 20px; } }
                          `}</style>
                          <input
                            className="ntoggler-input"
                            id={`toggle-${item.key}`}
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                          />
                          <label className="ntoggler-label" htmlFor={`toggle-${item.key}`}>
                            <svg className="ntoggler-svg ntoggler-on" viewBox="0 0 130.2 130.2">
                              <polyline className="npath" points="100.2,40.2 51.5,88.8 29.8,67.5" />
                            </svg>
                            <svg className="ntoggler-svg ntoggler-off" viewBox="0 0 130.2 130.2">
                              <line className="npath" x1="34.4" y1="34.4" x2="95.8" y2="95.8" />
                              <line className="npath" x1="95.8" y1="34.4" x2="34.4" y2="95.8" />
                            </svg>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => toast.success("Preferences saved!")}
                    className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Save Preferences
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-card border border-destructive/30 rounded-lg p-6">
                  <h2 className="font-bold text-destructive mb-1">Danger Zone</h2>
                  <p className="text-xs text-muted-foreground mb-4">These actions are irreversible. Please be careful.</p>
                  <button className="bg-destructive/10 text-destructive border border-destructive/30 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    Delete Account
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountPage;