import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getActivationProfile,
  loginMember,
  redeemInvite,
  saveActivationProfile,
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
    refreshToken: hash.get("refresh_token") || query.get("refresh_token"),
  };
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [fullNamePlaceholder, setFullNamePlaceholder] = useState("Full name");
  const [usernamePlaceholder, setUsernamePlaceholder] = useState("Username");
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

          const response = await getActivationProfile(inviteToken);
          const profile = response.data;
          if (!cancelled && profile) {
            if (profile.full_name) setFullNamePlaceholder(profile.full_name);
            if (profile.username) setUsernamePlaceholder(profile.username);
          }
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

  const requireToken = () => {
    if (token) return true;
    toast({
      title: "Invitation required",
      description: "Open the approval link from your email first.",
      variant: "destructive",
    });
    return false;
  };

  const resolvedName = () =>
    fullName.trim() ||
    (fullNamePlaceholder !== "Full name" ? fullNamePlaceholder : "");

  const resolvedUsername = () =>
    username.trim() ||
    (usernamePlaceholder !== "Username" ? usernamePlaceholder : "");

  const goToPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireToken()) return;

    const nameToSave = resolvedName();
    const usernameToSave = resolvedUsername();

    if (!nameToSave) {
      toast({
        title: "Enter your full name",
        description: "This is stored on your CARBN profile.",
        variant: "destructive",
      });
      return;
    }
    if (usernameToSave.length < 2) {
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
        full_name: nameToSave,
        username: usernameToSave,
      });
      setFullName(nameToSave);
      setUsername(usernameToSave);
      setStep(2);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not save your name. Try again.";
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
      const nameToSave = resolvedName();
      const usernameToSave = resolvedUsername();
      const result = await setMemberPassword(token as string, {
        password,
        confirm_password: confirmPassword,
        full_name: nameToSave,
        username: usernameToSave,
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
          description: `Welcome, ${nameToSave.split(" ")[0] || usernameToSave}.`,
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
          <div className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em]">
            <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>1. Profile</span>
            <span className="text-border">/</span>
            <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>2. Password</span>
          </div>

          {loadingInvite ? (
            <p className="text-sm text-muted-foreground">Opening your invitation…</p>
          ) : step === 1 ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-charcoal">Your profile</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your username and full name. These are saved to your account, then you will set a password.
              </p>
              <form onSubmit={goToPassword} className="mt-6 flex flex-col gap-4">
                <label className="text-sm font-medium text-charcoal">
                  Username
                  <input
                    type="text"
                    minLength={2}
                    maxLength={40}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={usernamePlaceholder}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-sm font-medium text-charcoal">
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={fullNamePlaceholder}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting || !token}
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
                  Back to profile
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
