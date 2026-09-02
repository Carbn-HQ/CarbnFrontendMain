import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, Package, Shirt } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

interface HeroSectionProps {
  onStartNow: () => void;
}

const HeroSection = ({ onStartNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-10 pb-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-accent/60 backdrop-blur px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Built in Ghana, for Ghanaian tailors
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              The workshop runs itself.{" "}
              <span className="text-primary">You just sew.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Save every measurement, track every outfit from cutting to fitting,
              and never miss a deadline or unpaid balance again.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button size="lg" className="text-base px-7 py-6 rounded-full shadow-lg gap-2" onClick={onStartNow}>
                Start Tracking Orders Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-7 py-6 rounded-full gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600" asChild>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">14 days free. No card needed.</p>
          </motion.div>

          {/* Right: phone mock */}
          <motion.div
            className="relative mx-auto w-full max-w-[320px]"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative aspect-[9/19] rounded-[2.5rem] bg-card border-[10px] border-foreground/90 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/90 rounded-b-2xl z-10" />
              <div className="h-full bg-gradient-to-br from-background to-accent/30 p-5 pt-10 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active orders</p>
                  <p className="font-display text-3xl font-bold text-primary mt-1">12</p>
                </div>
                <div className="rounded-2xl bg-card border p-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="text-[11px] text-muted-foreground font-mono">TLR-0042</p>
                  </div>
                  <p className="font-semibold text-sm mt-1">Ama Mensah · Kaba & Slit</p>
                  <p className="text-[10px] text-cyan-600 mt-0.5">● Sewing</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-emerald-600" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Ready for fitting</p>
                  </div>
                  <p className="font-semibold text-sm mt-1">3 outfits — notify customers</p>
                </div>
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Outstanding balances</p>
                  <p className="font-display text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">GHS 420</p>
                </div>
              </div>
            </div>
            <motion.div
              className="absolute -right-6 top-12 bg-card border shadow-xl rounded-2xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> "Your outfit is ready ✓"
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
