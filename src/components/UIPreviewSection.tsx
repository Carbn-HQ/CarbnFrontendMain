import { motion } from "framer-motion";
import { Crown, Users, DollarSign } from "lucide-react";

const previews = [
  {
    title: "Dashboard",
    subtitle: "Earnings at a glance",
    body: (
      <>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Today</p>
          <p className="font-display text-2xl font-bold text-primary">GHS 450</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl bg-emerald-500/10 p-2"><p className="text-[10px] text-muted-foreground">Week</p><p className="font-bold text-sm text-emerald-600">GHS 2,840</p></div>
          <div className="rounded-xl bg-blue-500/10 p-2"><p className="text-[10px] text-muted-foreground">Month</p><p className="font-bold text-sm text-blue-600">GHS 11,200</p></div>
        </div>
      </>
    ),
  },
  {
    title: "Customer List",
    subtitle: "Everyone in one place",
    body: (
      <div className="space-y-2">
        {["Kofi · 5 visits", "Akua · 4 visits", "Yaw · 3 visits", "Esi · 2 visits"].map((n, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-xs font-medium">{n}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Frequent Customers",
    subtitle: "Your VIPs",
    body: (
      <div className="space-y-2">
        {[{ n: "Kofi", v: 5, s: 250 }, { n: "Akua", v: 4, s: 180 }, { n: "Yaw", v: 3, s: 150 }].map((c, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <p className="text-xs font-semibold">{c.n}</p>
            </div>
            <p className="text-xs text-muted-foreground">{c.v}× · GHS {c.s}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const UIPreviewSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div className="max-w-2xl mx-auto text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Clean and simple.</span> Built for your phone.
          </h2>
          <p className="text-muted-foreground text-lg">No clutter. No confusion. Just what you need.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {previews.map((p, i) => (
            <motion.div
              key={p.title}
              className="mx-auto w-full max-w-[260px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative aspect-[9/17] rounded-[2rem] bg-card border-[8px] border-foreground/90 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-foreground/90 rounded-b-2xl z-10" />
                <div className="h-full bg-background p-4 pt-8">
                  <p className="font-display text-base font-bold">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground mb-3">{p.subtitle}</p>
                  {p.body}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UIPreviewSection;
