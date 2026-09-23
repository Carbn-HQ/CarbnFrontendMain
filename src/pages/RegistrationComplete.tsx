import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";

const RegistrationComplete = () => {
  const location = useLocation();
  const applyUrl =
    (location.state as { apply_url?: string } | null)?.apply_url || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-charcoal">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
            carbn<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="rounded-3xl bg-card p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold text-charcoal">
            Application received
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your registration was successful. We have sent a confirmation email.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Next, complete your Founding Fifty application so the team can review
            your details. The same link is in your confirmation email.
          </p>

          {applyUrl ? (
            <a
              href={applyUrl}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground"
            >
              Complete your application
            </a>
          ) : null}

          <p className="mt-4 text-sm text-muted-foreground">
            If you are approved, you will get an email to add your full name and set your password.
          </p>

          <Link
            to="/"
            className="mt-8 inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-charcoal"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationComplete;
