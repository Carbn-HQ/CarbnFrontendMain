import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getWaitlistApplication,
  saveWaitlistApplication,
  type ApplicationField,
} from "@/lib/carbnApi";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary";

const emptyAnswers = (fields: ApplicationField[]) =>
  Object.fromEntries(fields.map((field) => [field.id, ""])) as Record<string, string>;

const Apply = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [fields, setFields] = useState<ApplicationField[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) {
        setError("Open the application link from your confirmation email.");
        setLoading(false);
        return;
      }

      try {
        const response = await getWaitlistApplication(token);
        if (cancelled) return;
        setEmail(response.data.email);
        setFields(response.data.fields);
        setAnswers({
          ...emptyAnswers(response.data.fields),
          ...Object.fromEntries(
            Object.entries(response.data.answers || {}).map(([key, value]) => [
              key,
              value == null ? "" : String(value),
            ])
          ),
        });
        setSubmitted(Boolean(response.data.submitted));
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "This application link is invalid or has expired.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const title = useMemo(
    () => (submitted ? "Update your application" : "Complete your application"),
    [submitted]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;
    setSubmitting(true);

    try {
      const response = await saveWaitlistApplication(token, answers);
      setSubmitted(true);
      toast({
        title: "Application submitted",
        description: response.message,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not save your application.";
      toast({
        title: "Could not submit",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-charcoal">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
            carbn<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-soft">
          {loading ? (
            <p className="text-sm text-muted-foreground">Opening your application…</p>
          ) : error ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-charcoal">
                Application link needed
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Link
                to="/"
                className="mt-6 inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-charcoal"
              >
                Back to home
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-charcoal">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This is the Founding Fifty application for {email}. The CARBN team will
                review these answers with your registration.
              </p>

              {submitted ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-charcoal">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2.5} />
                  <span>Your application is with the team. You can still update any answer below.</span>
                </div>
              ) : null}

              <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                {fields.map((field) => (
                  <label key={field.id} className="text-sm font-medium text-charcoal">
                    {field.label}
                    {field.required ? <span className="text-primary"> *</span> : null}
                    {field.type === "textarea" ? (
                      <textarea
                        required={field.required}
                        rows={4}
                        value={answers[field.id] || ""}
                        onChange={(e) =>
                          setAnswers((current) => ({ ...current, [field.id]: e.target.value }))
                        }
                        className={`${inputClass} mt-1.5 min-h-[120px] resize-y`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) =>
                          setAnswers((current) => ({ ...current, [field.id]: e.target.value }))
                        }
                        className={`${inputClass} mt-1.5`}
                      >
                        <option value="">Select an option</option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        required={field.required}
                        min={field.type === "number" ? 16 : undefined}
                        max={field.type === "number" ? 100 : undefined}
                        value={answers[field.id] || ""}
                        onChange={(e) =>
                          setAnswers((current) => ({ ...current, [field.id]: e.target.value }))
                        }
                        className={`${inputClass} mt-1.5`}
                      />
                    )}
                  </label>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : submitted
                      ? "Update application"
                      : "Submit application"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apply;
