import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { setWaitlistUsername } from "@/lib/carbnApi";

const CompleteProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base text-charcoal outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !id || submitting) return;
    setSubmitting(true);
    try {
      const data = await setWaitlistUsername(id, {
        username: username.trim(),
        last_name: lastName.trim() || undefined,
      });
      if (data?.success) {
        localStorage.setItem("carbn_user_firstname", username.trim());
        if (lastName.trim()) {
          localStorage.setItem("carbn_user_lastname", lastName.trim());
        }
        toast({
          title: "Username saved",
          description: `Welcome, ${username.trim()}. We'll greet you with this name when you log in.`,
        });
        navigate("/registration-complete");
      } else {
        toast({
          title: "Could not save username",
          description: data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not reach the server. Please try again.";
      toast({
        title: "Could not save username",
        description: message,
        variant: "destructive",
      });
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
          <h1 className="font-display text-2xl font-semibold text-charcoal">
            Set your username
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your application was received. Choose the name we should use when you log in.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
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
            <input
              type="text"
              maxLength={40}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name (optional)"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-extrabold uppercase tracking-wider text-sm text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60"
            >
              {submitting ? "Saving..." : (<>Save username <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
