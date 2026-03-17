import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { categories, fetchProductsFromAPI, Product } from "@/data/products";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "reviews", label: "Most Reviews" },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    // slug se actual category name nikalo backend ke liye
    const categoryName = categories.find(c => c.slug === selectedCategory)?.name;
    fetchProductsFromAPI(categoryName)
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory]); // category change hone par refetch

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "reviews": result.sort((a, b) => b.reviews - a.reviews); break;
    }
    return result;
  }, [allProducts, searchQuery, sort, priceRange, minRating]);

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("category", slug); else params.delete("category");
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || "Products" : "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden p-2 border border-border rounded-lg">
              <FiFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? "fixed inset-0 z-50 bg-card p-6 overflow-auto" : "hidden"} md:block md:static md:w-60 flex-shrink-0`}>
            <div className="flex items-center justify-between md:hidden mb-4">
              <h3 className="font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-foreground">Categories</h4>
                <div className="space-y-1">
                  <button onClick={() => selectCategory("")} className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${!selectedCategory ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => selectCategory(cat.slug)} className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${selectedCategory === cat.slug ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-foreground">Price Range</h4>
                <div className="flex gap-2">
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-card text-foreground" placeholder="Min" />
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-card text-foreground" placeholder="Max" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-foreground">Min Rating</h4>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${minRating === r ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                      {"★".repeat(r)}{"☆".repeat(5 - r)} & up
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;