import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getWaitlistApplication,
  saveWaitlistApplication,
  type ApplicationField,
} from "@/lib/carbnApi";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary";

type AnswerValue = string | string[];

const emptyValue = (field: ApplicationField): AnswerValue =>
  field.type === "multiselect" ? [] : "";

const toAnswerValue = (field: ApplicationField, value: unknown): AnswerValue => {
  if (field.type === "multiselect") {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  }
  return value == null ? "" : String(value);
};

const SearchableSelect = ({
  field,
  value,
  onChange,
}: {
  field: ApplicationField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [value]);

  const options = field.options || [];
  const filtered = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={boxRef} className="relative mt-1.5">
      <input
        type="text"
        required={field.required}
        autoComplete="off"
        value={query}
        placeholder={field.placeholder || "Type to search"}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        className={inputClass}
      />
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {open ? (
        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-white shadow-soft">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matching countries</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setQuery(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-primary/10 ${
                  option === value ? "font-semibold text-charcoal" : "text-charcoal"
                }`}
              >
                <span>{option}</span>
                {option === value ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

const MultiSelect = ({
  field,
  value,
  onChange,
}: {
  field: ApplicationField;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const selected = Array.isArray(value) ? value : [];

  return (
    <div className="mt-1.5 grid gap-2">
      {(field.options || []).map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-normal text-charcoal"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                onChange(
                  checked
                    ? selected.filter((item) => item !== option)
                    : [...selected, option]
                );
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
};

const Apply = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [fields, setFields] = useState<ApplicationField[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
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
        setAnswers(
          Object.fromEntries(
            response.data.fields.map((field) => [
              field.id,
              toAnswerValue(field, response.data.answers?.[field.id] ?? emptyValue(field)),
            ])
          )
        );
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

  const setAnswer = (id: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;

    const missing = fields.find((field) => {
      if (!field.required) return false;
      const value = answers[field.id];
      if (field.type === "multiselect") {
        return !Array.isArray(value) || value.length === 0;
      }
      return !String(value || "").trim();
    });

    if (missing) {
      toast({
        title: "Complete required fields",
        description: `Please complete ${missing.label.toLowerCase()}.`,
        variant: "destructive",
      });
      return;
    }

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
                        value={typeof answers[field.id] === "string" ? answers[field.id] : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className={`${inputClass} mt-1.5 min-h-[120px] resize-y`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        required={field.required}
                        value={typeof answers[field.id] === "string" ? answers[field.id] : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className={`${inputClass} mt-1.5`}
                      >
                        <option value="">Select an option</option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "searchable_select" ? (
                      <SearchableSelect
                        field={field}
                        value={typeof answers[field.id] === "string" ? answers[field.id] : ""}
                        onChange={(next) => setAnswer(field.id, next)}
                      />
                    ) : field.type === "multiselect" ? (
                      <MultiSelect
                        field={field}
                        value={Array.isArray(answers[field.id]) ? answers[field.id] : []}
                        onChange={(next) => setAnswer(field.id, next)}
                      />
                    ) : (
                      <input
                        type="text"
                        required={field.required}
                        value={typeof answers[field.id] === "string" ? answers[field.id] : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
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
