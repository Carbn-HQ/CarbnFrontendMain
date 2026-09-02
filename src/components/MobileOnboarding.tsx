import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ruler, ListChecks, BellRing, Camera, Wallet, Sparkles } from "lucide-react";

interface MobileOnboardingProps {
  onSignup: () => void;
  onLogin: () => void;
}

const slides = [
  { icon: Ruler, title: "Save Measurements Forever", description: "Chest, waist, sleeve — stored against every customer. Never re-measure.", bg: "bg-primary/10", color: "text-primary" },
  { icon: ListChecks, title: "Track Every Outfit", description: "Cutting → sewing → fitting → ready. Always know what's where.", bg: "bg-cyan-500/10", color: "text-cyan-500" },
  { icon: BellRing, title: "Never Miss a Deadline", description: "Due-soon and overdue alerts every morning. Customers stay happy.", bg: "bg-amber-500/10", color: "text-amber-500" },
  { icon: Camera, title: "Build a Design Archive", description: "Snap every finished outfit. Customers reorder old styles instantly.", bg: "bg-purple-500/10", color: "text-purple-500" },
  { icon: Wallet, title: "Know Who Owes What", description: "Deposits, balances, payment history — visible on every order.", bg: "bg-emerald-500/10", color: "text-emerald-500" },
  { icon: Sparkles, title: "Just GHS 100 / Month", description: "Less than GHS 4 a day. One returning customer pays for the month.", bg: "bg-yellow-500/10", color: "text-yellow-600" },
];

const MobileOnboarding = ({ onSignup, onLogin }: MobileOnboardingProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 text-center">
        <span className="font-display text-xl font-bold tracking-tight">
          Smart<span className="text-primary">Tailor</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="text-center w-full"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${slides[current].bg} mb-8`}>
              {(() => {
                const Icon = slides[current].icon;
                return <Icon className={`w-10 h-10 ${slides[current].color}`} />;
              })()}
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">{slides[current].title}</h2>
            <p className="text-muted-foreground text-base max-w-xs mx-auto">{slides[current].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="px-6 pb-8 space-y-3">
        <Button size="lg" className="w-full rounded-full py-6 text-base" onClick={onSignup}>
          Start Free Trial
        </Button>
        <Button variant="ghost" size="lg" className="w-full rounded-full py-6 text-base" onClick={onLogin}>
          Already have an account? Log in
        </Button>
      </div>
    </div>
  );
};

export default MobileOnboarding;
