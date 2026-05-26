import { FormEvent, useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, Loader2, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
    }
  }, [token]);

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    return null;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, password });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden border-r border-border bg-muted/30 p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Behavioral AI</span>
        </Link>

        <div className="max-w-md space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Password reset</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
            Choose a strong, secure password to protect your behavioral data.
          </h1>
          <p className="leading-7 text-muted-foreground">
            Your new password should be unique and not used across other platforms.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">End-to-end encrypted password reset flow.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-7">
          <Button variant="ghost" asChild className="px-0">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </Button>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Set new password</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your new password below. Ensure it is strong and unique.
            </p>
          </div>

          {success ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <h2 className="text-lg font-semibold text-foreground mb-1">Password reset successful!</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!token && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Invalid reset link. Please request a new password reset from the{" "}
                    <Link to="/forgot-password" className="underline font-medium">
                      forgot password page
                    </Link>
                    .
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10"
                    disabled={loading || !token}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-10"
                    disabled={loading || !token}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 border px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-500" : ""}`}>
                    <span className="h-1 w-1 rounded-full bg-current" /> At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-500" : ""}`}>
                    <span className="h-1 w-1 rounded-full bg-current" /> At least one uppercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? "text-emerald-500" : ""}`}>
                    <span className="h-1 w-1 rounded-full bg-current" /> At least one lowercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? "text-emerald-500" : ""}`}>
                    <span className="h-1 w-1 rounded-full bg-current" /> At least one number
                  </li>
                </ul>
              </div>

              <Button type="submit" className="h-12 w-full" disabled={loading || !token}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
