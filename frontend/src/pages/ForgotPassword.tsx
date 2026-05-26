import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, Loader2, Mail, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset request.";
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Account recovery</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
            Secure access for a private behavioral workspace.
          </h1>
          <p className="leading-7 text-muted-foreground">
            Password recovery is designed to keep analysis history protected while helping users return safely.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">JWT-secured authentication and private report access.</p>
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
            <h1 className="font-display text-3xl font-bold text-foreground">Reset password</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email and we will send a secure password reset link.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                Reset link sent
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                If an account exists for <strong className="text-foreground">{email}</strong>, a secure reset link has been sent. Please check your inbox and follow the instructions to reset your password. The link expires in 30 minutes.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Send another email
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {loading ? "Sending..." : "Send reset instructions"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
