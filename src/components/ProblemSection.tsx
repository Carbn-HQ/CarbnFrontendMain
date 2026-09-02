import { motion } from "framer-motion";
import { Ruler, CalendarX, FileQuestion, Wallet } from "lucide-react";

const pains = [
  { icon: Ruler, text: "Measurements scribbled in notebooks — and lost when she returns." },
  { icon: CalendarX, text: "Deadlines forgotten. Angry customers at the door." },
  { icon: FileQuestion, text: "“Which fabric was for which client?” No one remembers." },
  { icon: Wallet, text: "Half-paid orders pile up. You can't tell who still owes." },
];

const ProblemSection = () => {
  return (
    <section className="py-28 bg-muted/30 border-y">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">The Daily Struggle</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Running a tailoring shop on{" "}
            <span className="text-destructive">memory & paper</span> is costing you.
          </h2>
          <p className="text-muted-foreground text-lg">
            Every lost measurement, missed deadline, or forgotten balance is money walking out the door.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {pains.map((p, i) => (
            <motion.div
              key={p.text}
              className="flex items-start gap-4 rounded-2xl bg-card border p-6 hover:border-destructive/40 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-base font-medium pt-2 leading-snug">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
