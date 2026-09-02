import { motion } from "framer-motion";
import { Ruler, ListChecks, BellRing } from "lucide-react";

const steps = [
  { n: 1, icon: Ruler, title: "Save measurements once", desc: "Chest, waist, sleeve, length — stored forever against every customer." },
  { n: 2, icon: ListChecks, title: "Move orders through the pipeline", desc: "Cutting → sewing → fitting → ready. Always know what's where." },
  { n: 3, icon: BellRing, title: "Never miss a fitting date", desc: "Due-soon and overdue alerts surface on your dashboard every morning." },
];

const SolutionSection = () => {
  return (
    <section className="py-28">
      <div className="container mx-auto px-6">
        <motion.div className="max-w-2xl mx-auto text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Your whole workshop, <span className="text-primary">on one screen.</span>
          </h2>
          <p className="text-muted-foreground text-lg">Three steps. Built for how tailors actually work.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              className="relative rounded-2xl bg-card border p-8 hover:border-primary/40 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute -top-4 left-8 inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-display font-bold shadow-md">
                {s.n}
              </div>
              <s.icon className="w-8 h-8 text-primary mb-5 mt-2" />
              <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
