import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as "CUSTOMER",
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setIsLogin((prev) => !prev);
    setForm({ name: "", email: "", password: "", role: "CUSTOMER" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isLogin && !form.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        // Always CUSTOMER — Admin role cannot be selected from UI
        await register(form.name.trim(), form.email, form.password, "CUSTOMER");
        toast.success("Account created! Welcome to CartNest 🎉");
      }
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-1 green-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-secondary/50 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <Link to="/" className="inline-block mb-8">
            <span className="text-secondary text-5xl font-black">Cart</span>
            <span className="text-primary-foreground text-5xl font-black">Nest</span>
          </Link>
          <p className="text-primary-foreground/60 text-lg max-w-sm mx-auto leading-relaxed">
            Your trusted online shopping destination. Discover amazing deals on thousands of products.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center justify-center gap-0.5 mb-8 lg:hidden">
            <span className="text-primary text-3xl font-black">Cart</span>
            <span className="text-secondary text-3xl font-black">Nest</span>
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-card)]">
            <h1 className="text-2xl font-black text-foreground text-center mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-7">
              {isLogin ? "Sign in to your account" : "Join CartNest today"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Registration-only fields */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              {isLogin && (
                <div className="text-right">
                  <a href="#" className="text-xs text-primary font-semibold hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading
                  ? isLogin ? "Signing in…" : "Creating account…"
                  : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-7">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={handleToggleMode} className="text-primary font-bold hover:underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;