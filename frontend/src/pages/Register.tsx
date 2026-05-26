import { useState, FormEvent, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function passwordStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  const clearError = () => {
    if (error) setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await register(
        trimmedName,
        trimmedEmail,
        password
      );

      if (!res.ok) {
        setError(res.error || "Could not create account.");
        return;
      }

      toast.success(`Welcome, ${trimmedName.split(" ")[0]}!`);
      navigate("/app");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* FORM SIDE */}
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">BE Analysis</span>
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2">
              Start your first behavioral analysis in minutes.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError(); }}
                  disabled={loading}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
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
              <label className="text-sm font-medium" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

              {/* Visual password strength bar */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {colors.map((color, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={strength <= 1 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                      {labels[strength]}
                    </span>
                    {strength >= 4 && (
                      <span className="text-green-600 font-medium">Great password!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); clearError(); }}
                  disabled={loading}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By creating an account you agree to our Terms &
              Privacy Policy.
            </p>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-l bg-muted/20 order-1 lg:order-2">

        <div className="relative flex justify-end">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">BE Analysis</span>
          </Link>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your private{" "}
            <span className="text-primary">
              behavioral lab
            </span>
            .
          </h2>

          <ul className="space-y-3">
            {[
              "Adaptive AI questionnaire & open chat",
              "Real-time facial & voice signal capture",
              "Reports with charts and insights",
              "Private session history",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Free to start · No card required
        </p>
      </div>
    </div>
  );
};

export default Register;
