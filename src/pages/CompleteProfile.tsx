import { Link } from "react-router-dom";

const CompleteProfile = () => {
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
            Application received
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not need to add your name yet. Check your inbox for the registration confirmation. If you are approved, we will email you a link to set your full name and password.
          </p>
          <Link
            to="/registration-complete"
            className="mt-6 inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-charcoal"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
