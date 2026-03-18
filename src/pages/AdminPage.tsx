import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiPackage, FiGrid, FiShoppingBag, FiUsers, FiBarChart2, FiMenu, FiX, FiLogOut, FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { fetchProductsFromAPI, Product } from "@/data/products";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: FiBarChart2 },
  { id: "products", label: "Products", icon: FiPackage },
  { id: "categories", label: "Categories", icon: FiGrid },
  { id: "orders", label: "Orders", icon: FiShoppingBag },
  { id: "users", label: "Users", icon: FiUsers },
];

const stats = [
  { label: "Total Revenue", value: "₹48,520", icon: FiDollarSign, change: "+12.5%", color: "bg-primary/10 text-primary" },
  { label: "Total Orders", value: "1,284", icon: FiShoppingBag, change: "+8.2%", color: "bg-secondary/20 text-secondary-foreground" },
  { label: "Total Products", value: "156", icon: FiPackage, change: "+3", color: "bg-accent text-accent-foreground" },
  { label: "Total Users", value: "3,842", icon: FiUsers, change: "+15.3%", color: "bg-info/10 text-info" },
];

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", total: 129.99, status: "Delivered", payment: "Paid", date: "Mar 8" },
  { id: "ORD-002", customer: "Jane Smith", total: 299.99, status: "Shipped", payment: "Paid", date: "Mar 7" },
  { id: "ORD-003", customer: "Bob Wilson", total: 79.99, status: "Processing", payment: "Pending", date: "Mar 7" },
  { id: "ORD-004", customer: "Alice Brown", total: 449.99, status: "Processing", payment: "Paid", date: "Mar 6" },
];

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", orders: 12, status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 8, status: "Active" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", orders: 3, status: "Blocked" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-success/10 text-success",
  Shipped: "bg-info/10 text-info",
  Processing: "bg-warning/10 text-warning",
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Active: "bg-success/10 text-success",
  Blocked: "bg-destructive/10 text-destructive",
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { logout } = useAuth();

  useEffect(() => {
    fetchProductsFromAPI().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 green-gradient text-primary-foreground flex flex-col transition-transform`}>
        <div className="flex items-center justify-between p-5 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-secondary text-xl font-black">Cart</span>
            <span className="text-primary-foreground text-xl font-black">Nest</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden"><FiX className="w-5 h-5" /></button>
        </div>
        <span className="text-[10px] text-primary-foreground/40 px-5 pt-4 pb-2 uppercase tracking-[0.15em] font-semibold">Admin Panel</span>
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${activeTab === id ? "bg-secondary text-secondary-foreground font-bold shadow-sm" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-secondary transition-colors px-2 py-1.5"><FiHome className="w-4 h-4" />Back to Store</Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-destructive transition-colors px-2 py-1.5"><FiLogOut className="w-4 h-4" />Logout</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-5 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden"><FiMenu className="w-5 h-5" /></button>
            <h1 className="font-bold text-lg text-foreground capitalize">{activeTab}</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">A</div>
        </header>

        <main className="p-5 md:p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-5 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                      <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                    <span className="text-xs text-success flex items-center gap-1 mt-1.5 font-medium"><FiTrendingUp className="w-3 h-3" />{s.change}</span>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-foreground mb-5 text-lg">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-semibold">Order</th><th className="pb-3 font-semibold">Customer</th><th className="pb-3 font-semibold">Total</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 font-semibold">Payment</th>
                    </tr></thead>
                    <tbody>
                      {mockOrders.map((o) => (
                        <tr key={o.id} className="border-b border-border last:border-0">
                          <td className="py-3.5 font-semibold text-foreground">{o.id}</td>
                          <td className="py-3.5 text-muted-foreground">{o.customer}</td>
                          <td className="py-3.5 font-semibold text-foreground">₹{o.total}</td>
                          <td className="py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColors[o.status]}`}>{o.status}</span></td>
                          <td className="py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColors[o.payment]}`}>{o.payment}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground font-medium">{products.length} products</p>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform"><FiPlus className="w-4 h-4" />Add Product</button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                      <th className="p-4 font-semibold">Product</th><th className="p-4 font-semibold">Category</th><th className="p-4 font-semibold">Price</th><th className="p-4 font-semibold">Rating</th><th className="p-4 font-semibold">Actions</th>
                    </tr></thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.title} className="w-11 h-11 rounded-lg object-cover border border-border" />
                              <span className="font-semibold text-foreground line-clamp-1">{p.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground capitalize">{p.category}</td>
                          <td className="p-4 font-semibold text-foreground">₹{p.price}</td>
                          <td className="p-4 text-foreground">⭐ {p.rating}</td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              <button className="p-2 hover:bg-accent rounded-lg transition-colors"><FiEdit className="w-3.5 h-3.5 text-info" /></button>
                              <button className="p-2 hover:bg-destructive/5 rounded-lg transition-colors"><FiTrash2 className="w-3.5 h-3.5 text-destructive" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-5">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform"><FiPlus className="w-4 h-4" />Add Category</button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty", "Toys", "Automotive"].map((cat) => (
                  <div key={cat} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover-lift">
                    <span className="font-semibold text-foreground text-sm">{cat}</span>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-accent rounded-lg transition-colors"><FiEdit className="w-3.5 h-3.5 text-info" /></button>
                      <button className="p-1.5 hover:bg-destructive/5 rounded-lg transition-colors"><FiTrash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                    <th className="p-4 font-semibold">Order</th><th className="p-4 font-semibold">Customer</th><th className="p-4 font-semibold">Date</th><th className="p-4 font-semibold">Total</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Payment</th>
                  </tr></thead>
                  <tbody>
                    {mockOrders.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{o.id}</td>
                        <td className="p-4 text-muted-foreground">{o.customer}</td>
                        <td className="p-4 text-muted-foreground">{o.date}</td>
                        <td className="p-4 font-semibold text-foreground">₹{o.total}</td>
                        <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColors[o.status]}`}>{o.status}</span></td>
                        <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColors[o.payment]}`}>{o.payment}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                    <th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Email</th><th className="p-4 font-semibold">Orders</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Actions</th>
                  </tr></thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{u.name}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-foreground">{u.orders}</td>
                        <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColors[u.status]}`}>{u.status}</span></td>
                        <td className="p-4"><button className="text-xs text-primary font-semibold hover:underline">{u.status === "Active" ? "Block" : "Unblock"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;