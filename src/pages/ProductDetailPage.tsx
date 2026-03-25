import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiStar, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw, FiChevronRight, FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductsFromAPI, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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

// ─── Star Rating Input Component ──────────────────────────────────────────────
const StarRatingInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (r: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hovered || value);
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
                active
                  ? "text-warning fill-warning"
                  : "text-muted-foreground/30 hover:text-warning/50"
              }`}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
};

// ─── Display Stars (read-only) ────────────────────────────────────────────────
const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const cls = size === "lg" ? "w-6 h-6" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`${cls} ${
            i < Math.floor(rating)
              ? "text-warning fill-warning"
              : i < rating
              ? "text-warning fill-warning opacity-50"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
};

// ─── Rating Bar (for distribution) ───────────────────────────────────────────
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-3 text-right">{star}</span>
      <FiStar className="w-3 h-3 text-warning fill-warning flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-warning rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="w-6 text-right">{pct}%</span>
    </div>
  );
};

// ─── Time ago helper ──────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

// ─── Avatar color from name ───────────────────────────────────────────────────
const avatarColors = [
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-green-500/20 text-green-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
  "bg-cyan-500/20 text-cyan-400",
];
const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

// ─── API base ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Review state ─────────────────────────────────────────────────────────
  const [reviewsData, setReviewsData] = useState<ReviewsResponse>({
    reviews: [],
    avgRating: 0,
    totalReviews: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // ── Fetch product ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProductsFromAPI()
      .then((products) => {
        const found = products.find((p) => p.id === Number(id)) || null;
        setProduct(found);
        if (found) {
          setRelated(
            products
              .filter((p) => p.category === found.category && p.id !== found.id)
              .slice(0, 4)
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Fetch reviews ─────────────────────────────────────────────────────────
  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews?productId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data: ReviewsResponse = await res.json();
      setReviewsData(data);
    } catch (err) {
      console.error("Reviews fetch error:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  // ── Rating distribution ───────────────────────────────────────────────────
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviewsData.reviews.filter((r) => r.rating === star).length,
  }));

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    setFormError("");

    if (!formUsername.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!formComment.trim()) {
      setFormError("Please write a comment.");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          username: formUsername.trim(),
          rating: formRating,
          comment: formComment.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      // Reset form
      setFormUsername("");
      setFormRating(0);
      setFormComment("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);

      // Refresh reviews list
      await fetchReviews();
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Loading / Not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto" />
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
          <Link to="/products" className="text-primary mt-4 inline-block hover:underline">
            Browse products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container py-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container pb-12">
        {/* Product Info Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full aspect-square object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-3">
                <StarDisplay rating={reviewsData.avgRating || product.rating} />
                <span className="text-sm text-primary font-medium">
                  {reviewsData.avgRating > 0
                    ? reviewsData.avgRating.toFixed(1)
                    : product.rating}
                </span>
                <span className="text-sm text-muted-foreground">
                  (
                  {reviewsData.totalReviews > 0
                    ? `${reviewsData.totalReviews} reviews`
                    : `${product.reviews.toLocaleString()} reviews`}
                  )
                </span>
              </div>
            </div>

            <div className="border-t border-b border-border py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">
                  ₹{product.price}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              </div>
              <p className="text-xs text-success font-medium mt-1">
                Inclusive of all taxes
              </p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-medium text-foreground border-x border-border">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
              <span
                className={`text-sm font-medium ${
                  product.inStock ? "text-success" : "text-destructive"
                }`}
              >
                {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++)
                    addToCart({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.image,
                    });
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                onClick={() =>
                  isWishlisted(product.id)
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product)
                }
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  isWishlisted(product.id)
                    ? "border-destructive text-destructive bg-destructive/10"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <FiHeart
                  className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-destructive" : ""}`}
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: FiTruck, text: "Free Delivery" },
                { icon: FiShield, text: "1 Year Warranty" },
                { icon: FiRefreshCw, text: "30-Day Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Reviews Section ──────────────────────────────────────────────── */}
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Summary + Write Form */}
            <div className="md:col-span-1 space-y-6">

              {/* Avg Rating Summary Card */}
              <div className="bg-card border border-border rounded-xl p-5 text-center space-y-2">
                <div className="text-5xl font-black text-foreground">
                  {reviewsData.avgRating > 0
                    ? reviewsData.avgRating.toFixed(1)
                    : "—"}
                </div>
                <StarDisplay rating={reviewsData.avgRating} size="lg" />
                <p className="text-sm text-muted-foreground">
                  {reviewsData.totalReviews > 0
                    ? `Based on ${reviewsData.totalReviews} review${reviewsData.totalReviews > 1 ? "s" : ""}`
                    : "No reviews yet"}
                </p>
                {/* Rating Bars */}
                {reviewsData.totalReviews > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {ratingDistribution.map(({ star, count }) => (
                      <RatingBar
                        key={star}
                        star={star}
                        count={count}
                        total={reviewsData.totalReviews}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Write a Review Form */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-foreground text-sm">Write a Review</h3>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Your Name</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. Rahul S."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                </div>

                {/* Star Rating */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Rating</label>
                  <StarRatingInput value={formRating} onChange={setFormRating} />
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Comment</label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-destructive"
                    >
                      {formError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                  {formSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-success font-medium"
                    >
                      ✓ Review submitted successfully!
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={formSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {formSubmitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                  {formSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="md:col-span-2">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-muted" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-muted rounded" />
                          <div className="h-2.5 w-16 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-full bg-muted rounded" />
                        <div className="h-2.5 w-3/4 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewsData.reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border rounded-xl">
                  <FiStar className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Be the first to share your experience!
                  </p>
                </div>
              ) : (
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.07 } },
                  }}
                >
                  {reviewsData.reviews.map((review) => (
                    <motion.div
                      key={review.reviewId}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(
                              review.username
                            )}`}
                          >
                            {review.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {review.username}
                            </p>
                            <StarDisplay rating={review.rating} />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                          {timeAgo(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
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
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;