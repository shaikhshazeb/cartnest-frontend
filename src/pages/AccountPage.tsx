import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<OrderProduct[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const tabs = [
    { icon: FiUser, label: "Profile", id: "profile" },
    { icon: FiPackage, label: "Orders", id: "orders" },
    { icon: FiHeart, label: "Wishlist", id: "wishlist" },
    { icon: FiSettings, label: "Settings", id: "settings" },
  ];

  // Fetch orders when orders tab is opened
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

  // Group orders by order_id
  const groupedOrders = orders.reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {} as Record<string, OrderProduct[]>);

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
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
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
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
                  </div>
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
                      return (
                        <div key={orderId} className="border border-border rounded-lg overflow-hidden">
                          {/* Order header */}
                          <div className="flex items-center justify-between p-4 bg-accent/30">
                            <div>
                              <p className="font-semibold text-sm text-foreground">Order ID: <span className="text-primary">{orderId.slice(0, 20)}...</span></p>
                              <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length > 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">₹{totalAmount.toFixed(2)}</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[items[0]?.status as string] || "bg-success/10 text-success"}`}>{items[0]?.status}</span>
                            </div>
                          </div>
                          {/* Order items */}
                          <div className="divide-y divide-border">
                            {items.map((item, i) => (
                              <div key={i} className="flex gap-3 p-4">
                                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-border" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                    <span className="text-xs text-muted-foreground">₹{item.price_per_unit}/unit</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground">₹{Number(item.total_price).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
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
                            <button
                              onClick={() => { addToCart({ id: item.id, title: item.title, price: item.price, image: item.image }); removeFromWishlist(item.id); }}
                              className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:opacity-90"
                            >
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
                  <p className="text-xs text-muted-foreground mb-4">Update your password to keep your account secure</p>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Current Password</label>
                      <input type="password" placeholder="Enter current password" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                      <input type="password" placeholder="Enter new password" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-bold text-foreground mb-1">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground mb-4">Manage how you receive notifications</p>
                  <div className="space-y-4">
                    {[
                      { label: "Order Updates", desc: "Get notified about your order status" },
                      { label: "Deals & Offers", desc: "Receive alerts about sales and discounts" },
                      { label: "New Arrivals", desc: "Be the first to know about new products" },
                      { label: "Newsletter", desc: "Weekly newsletter with top picks" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                          <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors peer-focus:ring-2 peer-focus:ring-primary/20">
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
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