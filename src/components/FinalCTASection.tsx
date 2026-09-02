import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

interface FinalCTAProps { onStartNow: () => void; }

const FinalCTASection = ({ onStartNow }: FinalCTAProps) => {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-foreground" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-primary-foreground" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="max-w-2xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Start Tracking. Start Growing.
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join service businesses across Ghana already growing with Smart Tailor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-base px-8 py-6 rounded-full gap-2 shadow-xl" onClick={onStartNow}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-full gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
