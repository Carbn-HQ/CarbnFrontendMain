import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getActivationProfile,
  loginMember,
  saveActivationProfile,
  setMemberPassword,
} from "@/lib/carbnApi";
import { getInviteToken, saveInviteToken, saveSession } from "@/lib/session";
import { toast } from "@/hooks/use-toast";

const readInviteToken = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  return (
    hashParams.get("access_token") ||
    queryParams.get("access_token") ||
    getInviteToken()
  );
};

const inputClass =
  "w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary";

const SetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const inviteToken = readInviteToken();
    if (inviteToken) {
      saveInviteToken(inviteToken);
      setToken(inviteToken);
      window.history.replaceState({}, document.title, "/set-password");
      getActivationProfile(inviteToken)
        .then((response) => {
          const profile = response.data;
          if (profile?.full_name) setFullName(profile.full_name);
          if (profile?.username) setUsername(profile.username);
        })
        .catch(() => {});
    }
  }, []);

  const requireToken = () => {
    if (token) return true;
    toast({
      title: "Invitation required",
      description: "Open the approval link from your email first.",
      variant: "destructive",
    });
    return false;
  };

  const goToPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireToken()) return;
    if (fullName.trim().split(/\s+/).length < 2) {
      toast({
        title: "Enter your full name",
        description: "Include your first and last name.",
        variant: "destructive",
      });
      return;
    }
    if (username.trim().length < 2) {
      toast({
        title: "Enter a username",
        description: "Use at least 2 characters.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await saveActivationProfile(token as string, {
        full_name: fullName.trim(),
        username: username.trim(),
      });
      setStep(2);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save your name. Try again.";
      toast({ title: "Could not save profile", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireToken()) return;
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
      const result = await setMemberPassword(token as string, {
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim(),
        username: username.trim(),
      });
      const email = result?.data?.member?.email || result?.data?.user?.email;
      if (email) {
        const login = await loginMember(email, password);
        saveSession({
          accessToken: login.data.session.access_token,
          refreshToken: login.data.session.refresh_token,
          member: login.data.member,
        });
        toast({ title: "Account activated", description: `Welcome, ${fullName.trim().split(" ")[0]}.` });
        navigate("/dashboard");
        return;
      }
      toast({ title: "Password set", description: "You can now log in." });
      navigate("/login");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not set your password. The invitation link may have expired.";
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
          <div className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em]">
            <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>1. Profile</span>
            <span className="text-border">/</span>
            <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>2. Password</span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-charcoal">Your name</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your full name and the username we should use on your dashboard.
              </p>
              <form onSubmit={goToPassword} className="mt-6 flex flex-col gap-4">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={40}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Continue"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-charcoal">Set your password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a password to activate your Founding Fifty account.
              </p>
              <form onSubmit={activate} className="mt-6 flex flex-col gap-4">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className={inputClass}
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-muted-foreground hover:text-charcoal"
                >
                  Back to name
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
                >
                  {submitting ? "Activating..." : "Activate account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
