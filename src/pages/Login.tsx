import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginMember } from "@/lib/carbnApi";
import { saveSession } from "@/lib/session";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await loginMember(email.trim(), password);
      saveSession({
        accessToken: response.data.session.access_token,
        refreshToken: response.data.session.refresh_token,
        member: response.data.member,
      });
      toast({ title: "Welcome back", description: "You are signed in." });
      navigate("/dashboard");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not sign in. Check your email and password.";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-charcoal">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
            carbn<span className="text-primary">.</span>
          </Link>
        </div>
        <div className="rounded-3xl bg-card p-8 shadow-soft">
          <h1 className="font-display text-2xl font-semibold text-charcoal">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to chat with Daniel and see your progress.
          </p>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Not approved yet?{" "}
            <Link to="/" className="font-medium text-primary hover:underline">
              Join the waitlist
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
