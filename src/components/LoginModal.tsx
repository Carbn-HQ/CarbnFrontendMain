import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup: () => void;
}

const LoginModal = ({ open, onOpenChange, onSwitchToSignup }: LoginModalProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("smarttailor_logged_in", "true");
      onOpenChange(false);
      navigate("/dashboard");
    }, 2000);
  };

  const handleClose = (val: boolean) => {
    if (!val) { setForm({ phone: "", password: "" }); setLoading(false); }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Logging you in...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-primary" />
                </div>
              </div>
              <DialogTitle className="font-display text-2xl">Welcome Back</DialogTitle>
              <DialogDescription>Log in to your Smart Tailor account.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input id="login-phone" name="phone" type="tel" placeholder="e.g. 024 123 4567" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full py-6 text-base mt-2">
                Log In
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Not registered?{" "}
              <button type="button" className="text-primary font-medium hover:underline" onClick={() => { handleClose(false); onSwitchToSignup(); }}>
                Create an account
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
