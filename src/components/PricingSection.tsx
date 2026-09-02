import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MONTHLY_PRICE, CURRENCY } from "@/lib/constants";

interface PricingSectionProps {
  onStartNow: () => void;
}

const features = [
  "Unlimited customers & entries",
  "Daily, weekly, monthly earnings",
  "Frequent & inactive customer lists",
  "Top services analytics",
  "One-tap WhatsApp reminders",
  "Works offline — your data stays with you",
];

const PricingSection = ({ onStartNow }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            One simple price. <span className="text-primary">No surprises.</span>
          </h2>
          <p className="text-muted-foreground text-lg">14-day free trial. Cancel anytime.</p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto rounded-3xl bg-card border-2 border-primary p-8 shadow-xl ring-4 ring-primary/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-6">
            <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1 mb-3">SMART TAILOR PRO</span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-display text-5xl font-bold text-primary">{CURRENCY} {MONTHLY_PRICE}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Less than <strong className="text-foreground">{CURRENCY} 4 per day</strong> — one returning customer pays for the whole month.
            </p>
          </div>

          <ul className="space-y-3 mb-7">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Button size="lg" className="w-full text-base py-6 rounded-full" onClick={onStartNow}>
            Start Free Trial
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            14 days free. No card needed. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
