import { Link } from "react-router-dom";
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const mockOrders = [
  { id: "ORD-2024-001", date: "Mar 5, 2026", total: 129.99, status: "Delivered", items: 2 },
  { id: "ORD-2024-002", date: "Mar 2, 2026", total: 79.99, status: "Shipped", items: 1 },
  { id: "ORD-2024-003", date: "Feb 28, 2026", total: 349.99, status: "Processing", items: 3 },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-success/10 text-success",
  Shipped: "bg-info/10 text-info",
  Processing: "bg-warning/10 text-warning",
};

const AccountPage = () => {
  const { user, logout } = useAuth();

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
              {[
                { icon: FiUser, label: "Profile", active: true },
                { icon: FiPackage, label: "Orders" },
                { icon: FiHeart, label: "Wishlist" },
                { icon: FiSettings, label: "Settings" },
              ].map(({ icon: Icon, label, active }) => (
                <button key={label} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/5 transition-colors">
                <FiLogOut className="w-4 h-4" />Logout
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Profile */}
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

            {/* Orders */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-foreground mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date} · {order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${order.total}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountPage;
