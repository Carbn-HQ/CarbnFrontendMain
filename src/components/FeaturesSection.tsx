import { motion } from "framer-motion";
import { Users, DollarSign, Repeat, BarChart3, MessageCircle } from "lucide-react";

const features = [
  { icon: Users, title: "Customer tracking", desc: "Every visit, every name, never forgotten.", highlight: false },
  { icon: DollarSign, title: "Daily, weekly, monthly earnings", desc: "Always know exactly what you're making.", highlight: true },
  { icon: Repeat, title: "Frequent & inactive customer insights", desc: "See who comes back and who needs reminding.", highlight: false },
  { icon: BarChart3, title: "Simple business analytics", desc: "Top services, growth trends — no charts overload.", highlight: false },
  { icon: MessageCircle, title: "One-tap WhatsApp reminder", desc: "Bring inactive customers back instantly.", highlight: true },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Everything You Need.{" "}
            <span className="text-primary">Nothing You Don't.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Five features designed for how you actually run your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`rounded-2xl p-7 border transition-all duration-300 hover:shadow-lg ${
                f.highlight ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/30"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${f.highlight ? "bg-primary-foreground/20" : "bg-accent"}`}>
                <f.icon className={`w-5 h-5 ${f.highlight ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
              <p className={`text-sm leading-relaxed ${f.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
