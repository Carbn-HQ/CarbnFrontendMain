import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const SocialProofSection = () => {
  return (
    <section className="py-28">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-2xl mx-auto rounded-3xl bg-card border p-12 text-center shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Quote className="w-10 h-10 text-primary/30 mx-auto mb-5" />
          <div className="flex items-center justify-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="font-display text-2xl md:text-3xl font-medium leading-snug mb-8">
            "I used to lose measurements every other week. Since Smart Tailor, every customer comes
            back and her details are right there. My income went up — and I sleep better."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">K</div>
            <div className="text-left">
              <p className="font-semibold">Kwame Boateng</p>
              <p className="text-sm text-muted-foreground">Master tailor, Accra</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
