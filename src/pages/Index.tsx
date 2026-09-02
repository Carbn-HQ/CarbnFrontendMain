import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Activity, Heart, Infinity as InfinityIcon } from "lucide-react";
import heroImg from "@/assets/carbn-hero.jpg";
import aboutImg from "@/assets/carbn-about.jpg";
import { toast } from "@/hooks/use-toast";
import { checkWaitlistEmail, joinWaitlist } from "@/lib/carbnApi";

const Wordmark = () => (
  <Link to="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
    carbn<span className="text-primary">.</span>
  </Link>
);

const PrimaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-extrabold uppercase tracking-wider text-sm text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
  >
    {children}
  </button>
);

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
    <span className="h-px w-8 bg-primary" />
    {children}
  </div>
);

const FoundingBenefits = () => (
  <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
    {[
      "Free beta access",
      "Direct influence on product development",
      "Founder pricing for life",
      "Priority access to future releases",
    ].map((b) => (
      <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={3} />
        <span>{b}</span>
      </li>
    ))}
  </ul>
);

const WaitlistForm = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isDark = variant === "dark";

  const inputClass = `w-full flex-1 rounded-xl border px-5 py-3.5 text-base outline-none placeholder:font-normal focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
    isDark
      ? "border-white/20 bg-white/5 text-on-charcoal placeholder:text-white/60 focus:ring-offset-transparent"
      : "border-border bg-white text-charcoal placeholder:text-muted-foreground"
  }`;

  const showAlreadyRegistered = (message?: string) => {
    setEmailError(message || "You have already registered.");
  };

  const checkEmail = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed.includes("@")) {
      setEmailError("");
      return false;
    }

    try {
      const result = await checkWaitlistEmail(trimmed);
      if (result?.registered) {
        showAlreadyRegistered(result.message);
        return true;
      }
      setEmailError("");
      return false;
    } catch {
      return false;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || submitting) return;
    setSubmitting(true);

    try {
      const alreadyRegistered = await checkEmail(email);
      if (alreadyRegistered) {
        return;
      }

      const data = await joinWaitlist(email.trim());
      if (data?.success) {
        localStorage.setItem("carbn_user_email", email.trim());
        toast({
          title: "You're on the waitlist",
          description: data.message || "Check your email for confirmation.",
        });
        navigate("/registration-complete");
      } else if (data?.already_joined) {
        showAlreadyRegistered(data.message);
      } else {
        toast({
          title: "Registration failed",
          description: data?.message || "Please try again in a moment.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const payload = (error as { response?: { data?: { message?: string; already_joined?: boolean } } })
        ?.response?.data;
      if (payload?.already_joined) {
        showAlreadyRegistered(payload.message);
      } else {
        toast({
          title: "Could not join",
          description: payload?.message || "Could not reach the server. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={`flex flex-col gap-2 rounded-3xl p-3 ${
        isDark ? "bg-white/10 backdrop-blur" : "bg-card shadow-soft"
      }`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError("");
        }}
        onBlur={() => {
          void checkEmail(email);
        }}
        placeholder="Your email address"
        className={`${inputClass} ${emailError ? "border-red-500 focus:ring-red-500" : ""}`}
        aria-invalid={Boolean(emailError)}
      />
      {emailError ? (
        <p className={`px-1 text-sm font-medium ${isDark ? "text-red-300" : "text-red-600"}`}>
          {emailError}
        </p>
      ) : null}
      <PrimaryButton type="submit" disabled={submitting || Boolean(emailError)}>
        {submitting ? "Joining..." : (<>Join the Founding Beta <ArrowRight className="h-4 w-4" /></>)}
      </PrimaryButton>
    </form>
  );
};


const Index = () => {
  return (
    <div className="min-h-screen bg-background text-charcoal">
      {/* Announcement bar */}
      <div className="bg-charcoal text-on-charcoal">
        <div className="container-carbn flex flex-col items-center justify-center gap-1 py-2.5 text-center text-xs font-medium tracking-wide sm:flex-row sm:gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-semibold uppercase tracking-[0.2em]">Founding Beta Now Open</span>
          </span>
          <span className="hidden opacity-40 sm:inline">·</span>
          <span className="opacity-80">Limited to 50 founding members.</span>
        </div>
      </div>

      {/* Nav */}
      <header className="border-b border-border/60">
        <div className="container-carbn flex items-center justify-between py-5">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#what" className="transition-colors hover:text-charcoal">What Carbn Does</a>
            <a href="#why" className="transition-colors hover:text-charcoal">Why Carbn</a>
            <a href="#beta" className="transition-colors hover:text-charcoal">Founding Beta</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-charcoal transition-colors hover:text-primary sm:inline-flex"
            >
              Log in
            </Link>
            <a
              href="#beta"
              className="hidden rounded-full border border-charcoal/20 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-charcoal transition-colors hover:bg-charcoal hover:text-on-charcoal sm:inline-flex"
            >
              Join Beta
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-carbn grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <div className="md:col-span-6 md:pt-8">
            <SectionEyebrow>AI Human Performance Coach</SectionEyebrow>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-charcoal sm:text-5xl md:text-6xl lg:text-7xl">
              Build a body that can keep up with your life.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Carbn is an AI Human Performance Coach designed for busy people who want to improve
              their health, body composition, energy and longevity — without making fitness their
              full-time job.
            </p>

            <div className="mt-8 max-w-xl">
              <WaitlistForm />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Founding members receive
              </p>
              <FoundingBenefits />
            </div>
          </div>

          <div className="relative md:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted shadow-card">
              <img
                src={heroImg}
                alt="A person catching their breath on a coastal trail at golden hour"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/60 to-transparent p-6">
                <div className="flex items-center gap-3 text-on-charcoal">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Activity className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Founding Beta</div>
                    <div className="text-sm font-medium">50 seats · closing soon</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-card px-5 py-4 shadow-card md:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">This week</div>
              <div className="mt-1 font-display text-2xl font-semibold text-charcoal">+2.4kg lean</div>
              <div className="text-xs text-primary">on track for your goal</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-y border-border/60 bg-secondary/50">
        <div className="container-carbn grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <SectionEyebrow>The Problem</SectionEyebrow>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal sm:text-4xl md:text-5xl">
              Life gets bigger. Health often gets smaller.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground md:col-span-7">
            <p className="text-charcoal">You don't need another fitness app.</p>
            <p className="text-charcoal">You don't need another diet.</p>
            <p className="text-charcoal">You don't need another workout plan you'll abandon in two weeks.</p>
            <p className="pt-2 font-medium text-charcoal">
              You need a health system that works around the life you already have.
            </p>
            <p>
              Whether you're raising children, building a business, leading a team or juggling
              endless responsibilities, Carbn helps you make meaningful progress without chasing
              perfection.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT CARBN DOES — three cards */}
      <section id="what" className="py-20 md:py-28">
        <div className="container-carbn">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>
              <span className="mx-auto">What Carbn Does</span>
            </SectionEyebrow>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal sm:text-4xl md:text-5xl">
              Your AI Human Performance Coach.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three pillars, one integrated system that adapts to the reality of your everyday life.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Health",
                copy: "Nutrition, habits, body composition and sustainable weight loss.",
              },
              {
                icon: Activity,
                title: "Performance",
                copy: "Training, recovery, energy and physical capability.",
              },
              {
                icon: InfinityIcon,
                title: "Longevity",
                copy: "Building the foundations for a stronger, healthier future.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <article
                key={title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-charcoal">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-secondary/50 py-20 md:py-28">
        <div className="container-carbn">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionEyebrow>Who It's For</SectionEyebrow>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal sm:text-4xl md:text-5xl">
                Built for high-responsibility people.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Carbn is for the people carrying the most — and the least time to spend on
                themselves.
              </p>
            </div>
            <div className="md:col-span-7">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Busy parents",
                  "Professionals",
                  "Business owners",
                  "Leaders",
                  "People returning to fitness",
                  "Anyone tired of quick fixes",
                ].map((who) => (
                  <li
                    key={who}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-base font-medium text-charcoal shadow-soft"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {who}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CARBN */}
      <section id="why" className="py-20 md:py-28">
        <div className="container-carbn grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-card">
              <img
                src={aboutImg}
                alt="The founder of Carbn"
                loading="lazy"
                width={1200}
                height={1400}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 md:pt-4">
            <SectionEyebrow>Why We Built Carbn</SectionEyebrow>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal sm:text-4xl md:text-5xl">
              Modern health advice assumes people have unlimited time.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>Carbn was born from a simple frustration.</p>
              <p>But most people don't have unlimited time.</p>
              <p>
                Between careers, businesses, families and responsibilities, many people know
                what they should do but struggle to fit it into real life.
              </p>
              <p className="font-medium text-charcoal">Carbn was built to bridge that gap.</p>
              <p>
                To create practical, personalised support that adapts to the reality of your
                everyday life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING BETA — dark section */}
      <section id="beta" className="bg-charcoal text-on-charcoal">
        <div className="container-carbn py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <span className="h-px w-8 bg-accent" />
                Founding Beta
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-on-charcoal sm:text-4xl md:text-5xl">
                Help build Carbn.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                We're inviting a limited number of founding members to test the first version of
                Carbn — and to shape what it becomes.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                50 seats · limited access
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Free beta access",
                    "Direct access to the founder",
                    "Early feature releases",
                    "Lifetime founder pricing",
                    "Help shape the future of Carbn",
                    "Priority for future releases",
                  ].map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-white/90">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <WaitlistForm variant="dark" />
                  <p className="mt-3 text-xs text-white/50">
                    No spam. Unsubscribe any time. We'll only email you about founding beta access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-20 md:py-28">
        <div className="container-carbn max-w-3xl text-center">
          <SectionEyebrow>
            <span className="mx-auto">The Vision</span>
          </SectionEyebrow>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal sm:text-4xl md:text-5xl">
            This is just the beginning.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Carbn isn't being built as another fitness app. Our vision is to create a human
            performance ecosystem that helps people build stronger bodies, healthier habits and
            greater capacity for life.
          </p>

          <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {["AI Coaching", "Education", "Community", "Events", "Experiences"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-charcoal shadow-soft"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-10 text-base text-muted-foreground">
            A movement built around sustainable health and long-term wellbeing.
          </p>

          <div className="mt-10">
            <a href="#beta">
              <PrimaryButton>
                Join the Founding Beta <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container-carbn flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <Wordmark />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Carbn. Human performance, for real life.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
