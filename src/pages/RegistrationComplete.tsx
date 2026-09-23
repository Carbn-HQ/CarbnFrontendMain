import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const RegistrationComplete = () => {
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
            The CARBN team will review your application. If you are approved, you will get an email to add your full name and set your password.
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
