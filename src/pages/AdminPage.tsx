import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiPackage, FiGrid, FiShoppingBag, FiUsers, FiBarChart2, FiMenu, FiX, FiLogOut, FiPlus, FiEdit, FiTrash2, FiDollarSign, FiAlertTriangle, FiSlash, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { fetchProductsFromAPI, Product } from "@/data/products";
import { toast } from "sonner";

const BASE_URL = "https://cartnest-backend-ukav.onrender.com";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: FiBarChart2 },
  { id: "products", label: "Products", icon: FiPackage },
  { id: "categories", label: "Categories", icon: FiGrid },
  { id: "orders", label: "Orders", icon: FiShoppingBag },
  { id: "users", label: "Users", icon: FiUsers },
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

const categories = [
  { id: 1, name: "Electronics" }, { id: 2, name: "Fashion" }, { id: 3, name: "Clothing" },
  { id: 4, name: "Home & Kitchen" }, { id: 5, name: "Books" }, { id: 6, name: "Sports" },
  { id: 7, name: "Beauty" }, { id: 8, name: "Toys" },
];

interface ProductForm {
  name: string; description: string; price: string; stock: string; categoryId: string; imageUrl: string;
}
const emptyForm: ProductForm = { name: "", description: "", price: "", stock: "", categoryId: "1", imageUrl: "" };

const AnimatedCounter = ({ target, prefix = "" }: { target: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 1800 / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}</span>;
};

const Modal = ({ title, onClose, onSubmit, submitLabel, submitColor = "bg-primary", submitting, children }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
      <div className="flex gap-3 p-6 border-t border-border">
        <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors">Cancel</button>
        <button onClick={onSubmit} disabled={submitting} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 ${submitColor}`}>
          {submitting ? "Please wait..." : submitLabel}
        </button>
      </div>
    </div>
  </div>
);

const FormField = ({ label, type = "text", value, onChange, placeholder, as: As = "input", children }: any) => (
  <div>
    <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
    {As === "select" ? (
      <select value={value} onChange={onChange} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary">{children}</select>
    ) : As === "textarea" ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
    )}
  </div>
);

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  // Dashboard state
  const [dashFilter, setDashFilter] = useState("overall");
  const [dashMonth, setDashMonth] = useState(String(new Date().getMonth() + 1));
  const [dashYear, setDashYear] = useState(String(new Date().getFullYear()));
  const [dashDate, setDashDate] = useState(new Date().toISOString().split("T")[0]);
  const [dashData, setDashData] = useState<{ totalBusiness: number; totalOrders: number; categorySales: Record<string, number> } | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [catName, setCatName] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Chart refs
  const barChartRef = useRef<any>(null);
  const hbarChartRef = useRef<any>(null);
  const donutChartRef = useRef<any>(null);
  const chartInstances = useRef<any[]>([]);

  const destroyCharts = () => {
    chartInstances.current.forEach(c => { try { c.destroy(); } catch {} });
    chartInstances.current = [];
  };

  // Load products
  const loadProducts = () => {
    setLoading(true);
    fetchProductsFromAPI().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setDashLoading(true);
    try {
      let url = "";
      if (dashFilter === "overall") url = `${BASE_URL}/admin/business/overall`;
      else if (dashFilter === "monthly") url = `${BASE_URL}/admin/business/monthly?month=${dashMonth}&year=${dashYear}`;
      else if (dashFilter === "yearly") url = `${BASE_URL}/admin/business/yearly?year=${dashYear}`;
      else if (dashFilter === "daily") url = `${BASE_URL}/admin/business/daily?date=${dashDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setDashData(data);
    } catch {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setDashLoading(false);
    }

    // Fetch recent orders
    try {
      const res = await fetch(`${BASE_URL}/admin/business/recent-orders`);
      const data = await res.json();
      setRecentOrders(Array.isArray(data) ? data : []);
    } catch {
      setRecentOrders([]);
    }
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (activeTab === "dashboard") fetchDashboard(); }, [activeTab]);
  useEffect(() => {
    if (activeTab === "orders") {
      setOrdersLoading(true);
      fetch(`${BASE_URL}/admin/business/all-orders`)
        .then(res => res.json())
        .then(data => setAllOrders(Array.isArray(data) ? data : []))
        .catch(() => setAllOrders([]))
        .finally(() => setOrdersLoading(false));
    }
    if (activeTab === "users") {
      setUsersLoading(true);
      fetch(`${BASE_URL}/admin/users/all`)
        .then(res => res.json())
        .then(data => setAllUsers(Array.isArray(data) ? data : []))
        .catch(() => setAllUsers([]))
        .finally(() => setUsersLoading(false));
    }
    if (activeTab === "categories") {
      setCatLoading(true);
      fetch(`${BASE_URL}/admin/categories/all`)
        .then(res => res.json())
        .then(data => setAllCategories(Array.isArray(data) ? data : []))
        .catch(() => setAllCategories([]))
        .finally(() => setCatLoading(false));
    }
  }, [activeTab]);

  // Init charts when dashData changes
  useEffect(() => {
    if (!dashData) return;

    const GREEN = '#3b6d11', LGREEN = '#639922', GOLD = '#d4a017', TEAL = '#1D9E75', CORAL = '#D85A30', PURPLE = '#7F77DD';
    const COLORS = [GREEN, GOLD, TEAL, CORAL, LGREEN, PURPLE, '#BA7517', '#D4537E'];

    const initCharts = (ChartJS: any) => {
      destroyCharts();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const rev = dashData.totalBusiness || 0;
      const mockMonthly = months.map(() => Math.round((rev / 12) * (0.5 + Math.random() * 0.8)));
      mockMonthly[11] = Math.round(rev * 0.15);

      const bc = barChartRef.current;
      if (bc) {
        chartInstances.current.push(new ChartJS(bc, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              { label: 'Revenue', data: mockMonthly, backgroundColor: GREEN, borderRadius: 4 },
              { label: 'Trend', data: mockMonthly.map((_: number, i: number) => Math.round(mockMonthly.slice(0, i + 1).reduce((a: number, b: number) => a + b, 0) / (i + 1))), type: 'line', borderColor: GOLD, backgroundColor: 'transparent', pointBackgroundColor: GOLD, pointRadius: 3, tension: 0.4, borderWidth: 2 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1200, easing: 'easeOutQuart' }, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#888', font: { size: 10 }, callback: (v: number) => '₹' + (v / 1000).toFixed(0) + 'k' }, grid: { color: 'rgba(128,128,128,0.1)' } } } }
        }));
      }

      const cats = Object.keys(dashData.categorySales || {});
      const vals = Object.values(dashData.categorySales || {});
      const hb = hbarChartRef.current;
      if (hb && cats.length > 0) {
        chartInstances.current.push(new ChartJS(hb, {
          type: 'bar',
          data: { labels: cats, datasets: [{ data: vals, backgroundColor: COLORS.slice(0, cats.length), borderRadius: 4 }] },
          options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 1400, easing: 'easeOutBack' }, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.1)' } }, y: { ticks: { color: '#888', font: { size: 10 } }, grid: { display: false } } } }
        }));
      }

      const dc = donutChartRef.current;
      if (dc) {
        chartInstances.current.push(new ChartJS(dc, {
          type: 'doughnut',
          data: { labels: ['Success','Processing','Shipped','Failed'], datasets: [{ data: [65, 20, 10, 5], backgroundColor: [GREEN, GOLD, TEAL, CORAL], borderWidth: 2, borderColor: 'transparent' }] },
          options: { responsive: true, maintainAspectRatio: false, animation: { animateRotate: true, duration: 1500 }, plugins: { legend: { display: false } }, cutout: '65%' }
        }));
      }
    };

    if ((window as any).Chart) {
      initCharts((window as any).Chart);
    } else {
      const existing = document.getElementById('chartjs-cdn');
      if (!existing) {
        const s = document.createElement('script');
        s.id = 'chartjs-cdn';
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload = () => initCharts((window as any).Chart);
        document.head.appendChild(s);
      } else {
        const wait = setInterval(() => {
          if ((window as any).Chart) { clearInterval(wait); initCharts((window as any).Chart); }
        }, 100);
      }
    }

    return () => destroyCharts();
  }, [dashData]);

  // Product handlers
  const handleAdd = async () => {
    if (!form.name || !form.price || !form.stock || !form.imageUrl) { toast.error("Please fill all required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/products/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock), categoryId: parseInt(form.categoryId), imageUrl: form.imageUrl }) });
      if (res.ok) { toast.success("Product added!"); setShowAddModal(false); setForm(emptyForm); loadProducts(); }
      else toast.error("Failed to add product");
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error("Please fill all required fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/products/edit`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: selectedProduct?.id, name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock), imageUrl: form.imageUrl }) });
      if (res.ok) { toast.success("Product updated!"); setShowEditModal(false); setForm(emptyForm); loadProducts(); }
      else toast.error("Failed to update product");
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/products/delete`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: selectedProduct?.id }) });
      if (res.ok) { toast.success("Product deleted!"); setShowDeleteModal(false); loadProducts(); }
      else toast.error("Failed to delete product");
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  const openEdit = (p: Product) => { setSelectedProduct(p); setForm({ name: p.title, description: p.description, price: String(p.price), stock: "10", categoryId: "1", imageUrl: p.image }); setShowEditModal(true); };
  const openDelete = (p: Product) => { setSelectedProduct(p); setShowDeleteModal(true); };

  const handleBlockUser = async (username: string, block: boolean) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${block ? 'block' : 'unblock'}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        toast.success(`User ${block ? 'blocked' : 'unblocked'} successfully`);
        setAllUsers(prev => prev.map(u => u.username === username ? { ...u, isBlocked: block } : u));
      } else toast.error("Failed to update user");
    } catch { toast.error("Something went wrong"); }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/users/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUserToDelete.username }),
      });
      const text = await res.text();
      if (res.ok) {
        toast.success("User deleted successfully");
        setAllUsers(prev => prev.filter(u => u.username !== selectedUserToDelete.username));
        setShowDeleteUserModal(false);
        setSelectedUserToDelete(null);
      } else {
        toast.error("Failed: " + text);
      }
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadCategories = () => {
    setCatLoading(true);
    fetch(`${BASE_URL}/admin/categories/all`)
      .then(res => res.json())
      .then(data => setAllCategories(Array.isArray(data) ? data : []))
      .catch(() => setAllCategories([]))
      .finally(() => setCatLoading(false));
  };

  const handleAddCategory = async () => {
    if (!catName.trim()) { toast.error("Category name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: catName.trim() }),
      });
      if (res.ok) { toast.success("Category added!"); setShowAddCatModal(false); setCatName(""); loadCategories(); }
      else { const d = await res.json(); toast.error(d.error || "Failed to add category"); }
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  const handleEditCategory = async () => {
    if (!catName.trim()) { toast.error("Category name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories/edit`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCat.id, categoryName: catName.trim() }),
      });
      if (res.ok) { toast.success("Category updated!"); setShowEditCatModal(false); setCatName(""); loadCategories(); }
      else toast.error("Failed to update category");
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories/delete`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCat.id }),
      });
      if (res.ok) { toast.success("Category deleted!"); setShowDeleteCatModal(false); loadCategories(); }
      else toast.error("Failed to delete category");
    } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {showAddModal && (
        <Modal title="Add New Product" onClose={() => { setShowAddModal(false); setForm(emptyForm); }} onSubmit={handleAdd} submitLabel="Add Product" submitting={submitting}>
          <FormField label="Product Name *" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
          <FormField label="Description" as="textarea" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="Enter description" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (₹) *" type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            <FormField label="Stock *" type="number" value={form.stock} onChange={(e: any) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          <FormField label="Category *" as="select" value={form.categoryId} onChange={(e: any) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormField>
          <FormField label="Image URL *" value={form.imageUrl} onChange={(e: any) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg border border-border" onError={(e: any) => e.target.style.display = 'none'} />}
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Product" onClose={() => { setShowEditModal(false); setForm(emptyForm); }} onSubmit={handleEdit} submitLabel="Save Changes" submitting={submitting}>
          <FormField label="Product Name *" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
          <FormField label="Description" as="textarea" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="Enter description" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (₹) *" type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            <FormField label="Stock *" type="number" value={form.stock} onChange={(e: any) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          <FormField label="Image URL" value={form.imageUrl} onChange={(e: any) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg border border-border" onError={(e: any) => e.target.style.display = 'none'} />}
        </Modal>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && (
        <Modal title="Delete User" onClose={() => { setShowDeleteUserModal(false); setSelectedUserToDelete(null); }} onSubmit={handleDeleteUser} submitLabel="Delete" submitColor="bg-destructive" submitting={submitting}>
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center"><FiAlertTriangle className="w-7 h-7 text-destructive" /></div>
            <div>
              <p className="font-semibold text-foreground mb-1">Are you sure?</p>
              <p className="text-sm text-muted-foreground">This will permanently delete user <span className="font-semibold text-foreground">"{selectedUserToDelete?.username}"</span> and all their cart data. This cannot be undone.</p>
            </div>
          </div>
        </Modal>
      )}
      {showAddCatModal && (
        <Modal title="Add Category" onClose={() => { setShowAddCatModal(false); setCatName(""); }} onSubmit={handleAddCategory} submitLabel="Add Category" submitting={submitting}>
          <FormField label="Category Name *" value={catName} onChange={(e: any) => setCatName(e.target.value)} placeholder="e.g. Electronics" />
        </Modal>
      )}

      {/* Edit Category Modal */}
      {showEditCatModal && (
        <Modal title="Edit Category" onClose={() => { setShowEditCatModal(false); setCatName(""); }} onSubmit={handleEditCategory} submitLabel="Save Changes" submitting={submitting}>
          <FormField label="Category Name *" value={catName} onChange={(e: any) => setCatName(e.target.value)} placeholder="e.g. Electronics" />
        </Modal>
      )}

      {/* Delete Category Modal */}
      {showDeleteCatModal && (
        <Modal title="Delete Category" onClose={() => setShowDeleteCatModal(false)} onSubmit={handleDeleteCategory} submitLabel="Delete" submitColor="bg-destructive" submitting={submitting}>
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center"><FiAlertTriangle className="w-7 h-7 text-destructive" /></div>
            <p className="text-sm text-muted-foreground">Delete <span className="font-semibold text-foreground">"{selectedCat?.categoryName}"</span>? This cannot be undone.</p>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete Product" onClose={() => setShowDeleteModal(false)} onSubmit={handleDelete} submitLabel="Delete" submitColor="bg-destructive" submitting={submitting}>
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center"><FiAlertTriangle className="w-7 h-7 text-destructive" /></div>
            <div>
              <p className="font-semibold text-foreground mb-1">Are you sure?</p>
              <p className="text-sm text-muted-foreground">This will permanently delete <span className="font-semibold text-foreground">"{selectedProduct?.title}"</span>.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Sidebar */}
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

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-5 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden"><FiMenu className="w-5 h-5" /></button>
            <h1 className="font-bold text-lg text-foreground capitalize">{activeTab}</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">A</div>
        </header>

        <main className="p-5 md:p-8">

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Filter:</span>
                {["overall", "monthly", "yearly", "daily"].map(f => (
                  <button key={f} onClick={() => setDashFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${dashFilter === f ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"}`}>{f}</button>
                ))}
                {dashFilter === "monthly" && (
                  <>
                    <select value={dashMonth} onChange={e => setDashMonth(e.target.value)} className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none">
                      {["1","2","3","4","5","6","7","8","9","10","11","12"].map(m => (
                        <option key={m} value={m}>{new Date(2024, parseInt(m)-1).toLocaleString("default", { month: "long" })}</option>
                      ))}
                    </select>
                    <input type="number" value={dashYear} onChange={e => setDashYear(e.target.value)} placeholder="Year" className="w-24 px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none" />
                  </>
                )}
                {dashFilter === "yearly" && <input type="number" value={dashYear} onChange={e => setDashYear(e.target.value)} placeholder="Year" className="w-24 px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none" />}
                {dashFilter === "daily" && <input type="date" value={dashDate} onChange={e => setDashDate(e.target.value)} className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground outline-none" />}
                <button onClick={fetchDashboard} disabled={dashLoading} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                  {dashLoading ? "Loading..." : "Apply"}
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">Total Revenue</span>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FiDollarSign className="w-4 h-4" /></div>
                  </div>
                  {dashLoading ? <div className="h-8 w-32 bg-muted animate-pulse rounded" /> : <p className="text-2xl font-black text-foreground"><AnimatedCounter target={dashData?.totalBusiness || 0} prefix="₹" /></p>}
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">Total Orders</span>
                    <div className="w-9 h-9 rounded-lg bg-secondary/20 text-secondary-foreground flex items-center justify-center"><FiShoppingBag className="w-4 h-4" /></div>
                  </div>
                  {dashLoading ? <div className="h-8 w-20 bg-muted animate-pulse rounded" /> : <p className="text-2xl font-black text-foreground"><AnimatedCounter target={dashData?.totalOrders || 0} /></p>}
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">Total Products</span>
                    <div className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center"><FiPackage className="w-4 h-4" /></div>
                  </div>
                  <p className="text-2xl font-black text-foreground"><AnimatedCounter target={products.length} /></p>
                </div>
              </div>

              {/* Charts */}
              {dashData && (
                <>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-bold text-foreground mb-2 text-lg">Revenue Overview</h3>
                    <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{background:"#3b6d11"}}></span>Revenue</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{background:"#d4a017"}}></span>Trend</span>
                    </div>
                    <div style={{position:"relative",width:"100%",height:"220px"}}>
                      <canvas ref={barChartRef}></canvas>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="font-bold text-foreground mb-4 text-lg">Category Sales</h3>
                      <div style={{position:"relative",width:"100%",height:`${Math.max(Object.keys(dashData.categorySales || {}).length, 3) * 40 + 60}px`}}>
                        <canvas ref={hbarChartRef}></canvas>
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="font-bold text-foreground mb-2 text-lg">Order Status</h3>
                      <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
                        {[['Success','#3b6d11'],['Processing','#d4a017'],['Shipped','#1D9E75'],['Failed','#D85A30']].map(([l,c]) => (
                          <span key={l} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:c}}></span>{l}</span>
                        ))}
                      </div>
                      <div style={{position:"relative",width:"100%",height:"180px"}}>
                        <canvas ref={donutChartRef}></canvas>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Recent Orders */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-foreground mb-5 text-lg">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Date</th>
                    </tr></thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
                      ) : (
                        recentOrders.map((o) => (
                          <tr key={o.orderId} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="py-3.5 font-semibold text-foreground text-xs">{o.orderId?.slice(0, 16)}...</td>
                            <td className="py-3.5 text-muted-foreground">{o.username}</td>
                            <td className="py-3.5 font-semibold text-foreground">₹{Number(o.totalAmount).toFixed(2)}</td>
                            <td className="py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${o.status === 'SUCCESS' ? 'bg-success/10 text-success' : o.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{o.status}</span></td>
                            <td className="py-3.5 text-muted-foreground text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground font-medium">{products.length} products</p>
                <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                  <FiPlus className="w-4 h-4" />Add Product
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                  <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                        <th className="p-4 font-semibold">Product</th><th className="p-4 font-semibold">Price</th><th className="p-4 font-semibold">Actions</th>
                      </tr></thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.title} className="w-11 h-11 rounded-lg object-cover border border-border" />
                                <div>
                                  <span className="font-semibold text-foreground line-clamp-1">{p.title}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-foreground">₹{p.price}</td>
                            <td className="p-4">
                              <div className="flex gap-1.5">
                                <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-info/10 text-info rounded-lg text-xs font-semibold hover:bg-info/20 transition-colors"><FiEdit className="w-3.5 h-3.5" />Edit</button>
                                <button onClick={() => openDelete(p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold hover:bg-destructive/20 transition-colors"><FiTrash2 className="w-3.5 h-3.5" />Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">{allCategories.length} categories</p>
                <button onClick={() => { setCatName(""); setShowAddCatModal(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                  <FiPlus className="w-4 h-4" />Add Category
                </button>
              </div>
              {catLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allCategories.map((cat) => (
                    <div key={cat.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-colors">
                      <span className="font-semibold text-foreground text-sm">{cat.categoryName}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedCat(cat); setCatName(cat.categoryName); setShowEditCatModal(true); }} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                          <FiEdit className="w-3.5 h-3.5 text-info" />
                        </button>
                        <button onClick={() => { setSelectedCat(cat); setShowDeleteCatModal(true); }} className="p-1.5 hover:bg-destructive/5 rounded-lg transition-colors">
                          <FiTrash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {ordersLoading ? (
                <div className="p-8 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                      <th className="p-4 font-semibold">Order ID</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Total</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr></thead>
                    <tbody>
                      {allOrders.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No orders found</td></tr>
                      ) : (
                        allOrders.map((o) => (
                          <tr key={o.orderId} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="p-4 font-semibold text-foreground text-xs">{o.orderId?.slice(0, 16)}...</td>
                            <td className="p-4 text-muted-foreground">{o.username}</td>
                            <td className="p-4 text-muted-foreground text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                            <td className="p-4 font-semibold text-foreground">₹{Number(o.totalAmount).toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                o.status === 'SUCCESS' ? 'bg-success/10 text-success' :
                                o.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                                'bg-destructive/10 text-destructive'
                              }`}>{o.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {usersLoading ? (
                <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground bg-accent/50">
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Joined</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr></thead>
                    <tbody>
                      {allUsers.length === 0 ? (
                        <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No users found</td></tr>
                      ) : (
                        allUsers.map((u) => (
                          <tr key={u.userId} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{u.username?.[0]?.toUpperCase()}</div>
                                <span className="font-semibold text-foreground">{u.username}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{u.email}</td>
                            <td className="p-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>{u.role}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${u.isBlocked ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                            <td className="p-4">
                              {u.role !== 'ADMIN' && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleBlockUser(u.username, !u.isBlocked)}
                                    className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
                                    title={u.isBlocked ? 'Unblock user' : 'Block user'}
                                  >
                                    {u.isBlocked ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiSlash className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUserToDelete(u); setShowDeleteUserModal(true); }}
                                    className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                                    title="Delete user"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminPage;