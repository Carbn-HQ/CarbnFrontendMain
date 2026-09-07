import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginMember,
  redeemInvite,
  setMemberPassword,
} from "@/lib/carbnApi";
import { getInviteToken, saveInviteToken, saveSession } from "@/lib/session";
import { toast } from "@/hooks/use-toast";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary";

const readInviteFromUrl = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);

  return {
    activation: query.get("activation"),
    tokenHash:
      query.get("token_hash") ||
      query.get("hashed_token") ||
      (query.get("type") === "recovery" ? query.get("token") : null),
    type: query.get("type") || hash.get("type") || "recovery",
    accessToken: hash.get("access_token") || query.get("access_token"),
  };
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const fromUrl = readInviteFromUrl();
      let inviteToken =
        fromUrl.activation || fromUrl.accessToken || getInviteToken();

      try {
        if (!fromUrl.activation && fromUrl.tokenHash) {
          const redeemed = await redeemInvite({
            token_hash: fromUrl.tokenHash,
            type: fromUrl.type,
          });
          inviteToken = redeemed.data.access_token;
        }

        if (inviteToken) {
          saveInviteToken(inviteToken);
          if (!cancelled) setToken(inviteToken);
          window.history.replaceState({}, document.title, "/set-password");
        }
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Open the latest approval link from your email.";
        toast({
          title: "Invitation required",
          description: message,
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Invitation required",
        description: "Open the approval link from your email first.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await setMemberPassword(token, {
        password,
        confirm_password: confirmPassword,
      });
      const email = result?.data?.member?.email || result?.data?.user?.email;
      if (email) {
        const login = await loginMember(email, password);
        saveSession({
          accessToken: login.data.session.access_token,
          refreshToken: login.data.session.refresh_token,
          member: login.data.member,
        });
        toast({
          title: "Account activated",
          description: "Your password is set. Welcome to CARBN.",
        });
        navigate("/dashboard");
        return;
      }
      toast({ title: "Password set", description: "You can now log in." });
      navigate("/login");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not set your password. The invitation link may have expired.";
      toast({ title: "Could not activate account", description: message, variant: "destructive" });
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
          <h1 className="font-display text-2xl font-semibold text-charcoal">Set your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a password to activate your Founding Fifty account.
          </p>

          {loadingInvite ? (
            <p className="mt-6 text-sm text-muted-foreground">Opening your invitation…</p>
          ) : (
            <form onSubmit={activate} className="mt-6 flex flex-col gap-4">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className={inputClass}
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={submitting || !token}
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Activating..." : "Activate account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
