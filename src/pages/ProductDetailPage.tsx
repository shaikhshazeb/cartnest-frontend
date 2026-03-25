import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  FiStar,
  FiShoppingCart,
  FiHeart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiSend,
  FiMessageSquare,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductsFromAPI, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  reviewId: number;
  productId: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsResponse {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://cartnest-backend-ukav.onrender.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const AVATAR_COLORS = [
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Stars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
  const cls = size === "lg" ? "w-6 h-6" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`${cls} ${
            i < Math.floor(rating)
              ? "text-warning fill-warning"
              : i < rating
              ? "text-warning fill-warning opacity-40"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
};

const StarPicker = ({ value, onChange }: { value: number; onChange: (r: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} stars`}
          >
            <FiStar
              className={`w-7 h-7 transition-colors ${
                star <= active
                  ? "text-warning fill-warning"
                  : "text-muted-foreground/25 hover:text-warning/50"
              }`}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  );
};

const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-2 text-right tabular-nums">{star}</span>
      <FiStar className="w-3 h-3 text-warning fill-warning shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-warning rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        />
      </div>
      <span className="w-5 text-right tabular-nums">{count}</span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewsData, setReviewsData] = useState<ReviewsResponse>({ reviews: [], avgRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductsFromAPI()
      .then((products) => {
        const found = products.find((p) => p.id === Number(id)) || null;
        setProduct(found);
        if (found) {
          setRelated(products.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/reviews?productId=${id}`);
      if (!res.ok) throw new Error("Failed");
      const data: ReviewsResponse = await res.json();
      setReviewsData(data);
    } catch {
      // silently fail — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviewsData.reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async () => {
    setFormError("");
    if (!user) { setFormError("Please log in to submit a review."); return; }
    if (formRating === 0) { setFormError("Please select a star rating."); return; }
    if (!formComment.trim()) { setFormError("Please write a comment."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          username: user.username,
          rating: formRating,
          comment: formComment.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setFormRating(0);
      setFormComment("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3500);
      await fetchReviews();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex items-center justify-center">
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded-lg mx-auto" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded-lg mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Link to="/products" className="text-primary mt-4 inline-block hover:underline">Browse products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const displayAvg = reviewsData.avgRating > 0 ? reviewsData.avgRating : product.rating;
  const displayCount = reviewsData.totalReviews > 0 ? reviewsData.totalReviews : product.reviews;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      <div className="container pb-16">
        {/* Product Hero */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden">
            <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <div className="flex items-center gap-3">
                <Stars rating={displayAvg} size="md" />
                <span className="text-sm text-primary font-semibold">{displayAvg.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({displayCount.toLocaleString()} reviews)</span>
              </div>
            </div>

            <div className="border-t border-b border-border py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">₹{product.price.toLocaleString()}</span>
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">{discount}% OFF</span>
              </div>
              <p className="text-xs text-success font-medium mt-1">Inclusive of all taxes</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-foreground border-x border-border">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">+</button>
              </div>
              <span className={`text-sm font-medium ${product.inStock ? "text-success" : "text-destructive"}`}>
                {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { for (let i = 0; i < qty; i++) addToCart({ id: product.id, title: product.title, price: product.price, image: product.image }); }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <FiShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => isWishlisted(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                className={`px-4 py-3 border rounded-lg transition-colors ${isWishlisted(product.id) ? "border-destructive text-destructive bg-destructive/10" : "border-border text-foreground hover:bg-muted"}`}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-destructive" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[{ icon: FiTruck, text: "Free Delivery" }, { icon: FiShield, text: "1 Year Warranty" }, { icon: FiRefreshCw, text: "30-Day Returns" }]
                .map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-14 border-t border-border pt-10">
          <div className="flex items-center gap-2 mb-8">
            <FiMessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>
            {reviewsData.totalReviews > 0 && (
              <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {reviewsData.totalReviews}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: Summary + Form */}
            <div className="md:col-span-2 space-y-5">
              {/* Rating Summary */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-foreground tabular-nums leading-none">
                    {displayAvg.toFixed(1)}
                  </div>
                  <div className="space-y-1">
                    <Stars rating={displayAvg} size="lg" />
                    <p className="text-xs text-muted-foreground">
                      {reviewsData.totalReviews > 0
                        ? `${reviewsData.totalReviews} review${reviewsData.totalReviews > 1 ? "s" : ""}`
                        : "No reviews yet"}
                    </p>
                  </div>
                </div>
                {reviewsData.totalReviews > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {distribution.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={reviewsData.totalReviews} />
                    ))}
                  </div>
                )}
              </div>

              {/* Write Review Form */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Write a Review</h3>

                {user ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(user.username)}`}>
                      {user.username[0].toUpperCase()}
                    </div>
                    Posting as <span className="font-semibold text-foreground">{user.username}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link> to post a review.
                  </p>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Rating</label>
                  <StarPicker value={formRating} onChange={setFormRating} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Your Review</label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="What did you like or dislike?"
                    rows={3}
                    disabled={!user}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {formError && (
                    <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-destructive">{formError}</motion.p>
                  )}
                  {formSuccess && (
                    <motion.p key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-medium text-success">✓ Review submitted successfully!</motion.p>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !user}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    : <FiSend className="w-4 h-4" />}
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="md:col-span-3">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-muted" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-28 bg-muted rounded" />
                          <div className="h-2.5 w-20 bg-muted rounded" />
                        </div>
                        <div className="h-2.5 w-12 bg-muted rounded" />
                      </div>
                      <div className="space-y-1.5 pl-12">
                        <div className="h-2.5 w-full bg-muted rounded" />
                        <div className="h-2.5 w-4/5 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewsData.reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 border border-dashed border-border rounded-xl text-center px-6">
                  <FiStar className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No reviews yet</p>
                  <p className="text-xs text-muted-foreground">Be the first to share your experience!</p>
                </div>
              ) : (
                <motion.div className="space-y-3" initial="hidden" animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
                  {reviewsData.reviews.map((review) => (
                    <motion.div
                      key={review.reviewId}
                      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(review.username)}`}>
                            {review.username[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{review.username}</p>
                            <Stars rating={review.rating} />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                          {timeAgo(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed pl-11">
                          {review.comment}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;