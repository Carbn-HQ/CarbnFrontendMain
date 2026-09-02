import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need internet?", a: "No. Smart Tailor works fully offline. Your data is saved on your phone, so you can record customers and see earnings even with no signal." },
  { q: "Is it hard to use?", a: "No. If you can use WhatsApp, you can use Smart Tailor. Type a name, pick a service, tap save. That's it." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no fees. Cancel from your settings anytime, no questions asked." },
  { q: "Will my data be safe?", a: "Yes. Your customer data is yours. It stays on your device and is never shared with anyone else." },
];

const FAQSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Common <span className="text-primary">questions</span>
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border bg-card px-5">
                <AccordionTrigger className="text-left font-display text-base hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
