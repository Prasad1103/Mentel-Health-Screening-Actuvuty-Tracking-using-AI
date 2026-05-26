import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    if (error) setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await login(trimmedEmail, trimmedPassword);

      if (!res.ok) {
        setError(res.error || "Unable to sign in.");
        return;
      }

      if (remember) {
        localStorage.setItem("saved_email", trimmedEmail);
      } else {
        localStorage.removeItem("saved_email");
      }

      toast.success("Welcome back!");
      navigate("/app");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r bg-muted/20">

        <Link to="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">BE Analysis</span>
        </Link>

        <div className="relative space-y-6 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Pick up where you <span className="text-primary">left off</span>.
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            Continue your sessions, review reports, and explore new behavioral insights.
          </p>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Secure login powered by FastAPI backend
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold">Sign in</h1>
            <p className="text-muted-foreground">
              Access your dashboard and continue your journey.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  disabled={loading}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  disabled={loading}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me on this device
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            New to BE Analysis?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
