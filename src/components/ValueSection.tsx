import { motion } from "framer-motion";
import { Camera, Wallet, Repeat } from "lucide-react";

const points = [
  { icon: Camera, title: "A design archive customers love", desc: "Snap every finished outfit. Returning clients reorder with a tap." },
  { icon: Wallet, title: "Get paid every cedi you're owed", desc: "Deposits, balances and payment history visible on every order." },
  { icon: Repeat, title: "Returning customers, zero re-measuring", desc: "Her measurements are saved. New order in 30 seconds." },
];

const ValueSection = () => {
  return (
    <section className="py-28 bg-muted/30 border-y">
      <div className="container mx-auto px-6">
        <motion.div className="max-w-2xl mx-auto text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 mb-4">Why tailors switch</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Earn more from the customers <span className="text-emerald-500">you already have.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A finished outfit isn't the end of a sale — it's the start of the next one.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              className="rounded-2xl bg-card border p-8 text-center hover:border-emerald-500/40 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-5">
                <p.icon className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
