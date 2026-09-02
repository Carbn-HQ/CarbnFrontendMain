import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Download } from "lucide-react";
import { saveUserProfile } from "@/lib/store";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

const SignupModal = ({ open, onOpenChange, onSwitchToLogin }: SignupModalProps) => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    // Save user profile for settings
    saveUserProfile({
      businessName: form.businessName,
      ownerName: form.ownerName,
      phone: form.phone,
      email: form.email,
      location: form.location,
      password: form.password,
    });
    setSubmitted(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setForm({ businessName: "", ownerName: "", phone: "", email: "", location: "", password: "", confirmPassword: "" });
      setError("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">You're all set! 🎉</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                Your account has been created successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 w-full rounded-xl bg-accent/50 border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-primary" />
                <span className="font-display font-semibold text-sm">Download the App</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get the Smart Tailor app on Google Play to track customers on the go. All your data syncs with your account.
              </p>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                  Get it on Google Play
                </a>
              </Button>
            </div>

            <Button className="mt-4 rounded-full px-8" onClick={() => {
              localStorage.setItem("smarttailor_logged_in", "true");
              onOpenChange(false);
              navigate("/dashboard");
            }}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Get Started Free</DialogTitle>
              <DialogDescription>
                Tell us about your business and we'll set everything up for you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="e.g. Mama's Shop"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner's Full Name</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="e.g. Kwame Asante"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 024 123 4567"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. kwame@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Business Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Accra, Kumasi"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full rounded-full py-6 text-base mt-2">
                Create My Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Already registered?{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => {
                  handleClose(false);
                  onSwitchToLogin();
                }}
              >
                Log in
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
