import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Download, PlayCircle, Code, Terminal, Zap } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { lazy, Suspense, useState, useEffect } from "react";

// Lazy-load so Three.js never runs during SSR (fixes Vercel production)
const FloatingLines = lazy(() => import("@/components/ui/FloatingLines"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mahadevi Computers — Premium learning resources" },
      {
        name: "description",
        content:
          "Curated, premium educational resources for computer training, programming, competitive exams, and more. Learn at your own pace.",
      },
      { property: "og:title", content: "Mahadevi Computers — Premium learning resources" },
      {
        property: "og:description",
        content:
          "Curated educational resources for computer training, programming, and competitive exams.",
      },
    ],
  }),
  component: Home,
});

const categories = [
  "Computer Education",
  "Programming",
  "Typing",
  "Graphic Design",
  "Video Editing",
  "AI Tools",
  "Accounting",
  "Competitive Exams",
  "General Knowledge",
];

const features = [
  {
    icon: Shield,
    title: "Curated by experts",
    body: "Every resource is hand-picked and reviewed for quality — no filler, no noise.",
  },
  {
    icon: PlayCircle,
    title: "Watch or download",
    body: "Stream lectures securely in-browser or download PDFs, assignments, and practice files.",
  },
  {
    icon: Download,
    title: "Yours forever",
    body: "Once purchased, resources stay in your library. Access them anytime, on any device.",
  },
  {
    icon: Code,
    title: "Project-based",
    body: "Learn by building real-world projects that you can add to your portfolio.",
  },
  {
    icon: Terminal,
    title: "Developer focused",
    body: "Content designed with modern frameworks, tools, and best practices in mind.",
  },
  {
    icon: Zap,
    title: "Instant access",
    body: "Skip the fluff. Get straight to the core concepts and start learning immediately.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

function Home() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  return (
    <div className="bg-background relative selection:bg-accent/30 selection:text-accent-foreground">
      <Header />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16 border-b border-border">
          {/* FloatingLines — client-only, safe for SSR */}
          {isClient && (
            <div className="absolute inset-0 z-0">
              <Suspense fallback={null}>
                <FloatingLines
                  enabledWaves={['top', 'middle', 'bottom']}
                  lineCount={5}
                  lineDistance={4.5}
                  bendRadius={4.5}
                  bendStrength={-0.5}
                  interactive={true}
                  parallax={true}
                  animationSpeed={1}
                  mixBlendMode="screen"
                />
              </Suspense>
            </div>
          )}

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background/95 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 z-[5] bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/30 px-3 py-1 text-[11px] sm:text-xs text-foreground/80 backdrop-blur-md shadow-xl"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="font-medium tracking-wide">Introducing Mahadevi — premium learning, simplified</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 sm:mt-8 flex flex-col items-center"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[1.05]"
              >
                Learn without limits.
              </motion.h1>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-2xl leading-[1.1] mt-1 sm:mt-2"
              >
                Built for serious students.
              </motion.h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease }}
              className="mt-5 sm:mt-7 max-w-xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed drop-shadow-md px-2"
            >
              A hand-curated library of computer training, programming, and
              competitive-exam resources. No clutter. No distractions. Just the
              material you need to move forward.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.85, ease }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            >
              <Link
                to="/resources"
                className="group relative inline-flex h-11 sm:h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-6 sm:px-8 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Browse resources
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-indigo-200 via-white to-purple-200 opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-full border border-border/60 bg-surface/20 backdrop-blur-sm px-6 sm:px-8 text-sm font-medium text-foreground transition-all duration-300 hover:bg-surface/50 hover:text-white hover:border-border hover:scale-105 w-full sm:w-auto active:scale-95"
              >
                Learn more
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories marquee */}
        <section className="border-b border-border py-5 sm:py-7 overflow-hidden bg-background relative z-20">
          <div className="flex gap-10 sm:gap-12 whitespace-nowrap animate-[marquee_50s_linear_infinite]">
            {[...categories, ...categories, ...categories].map((c, i) => (
              <span
                key={i}
                className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-foreground cursor-default"
              >
                {c} <span className="ml-10 sm:ml-12 text-border">/</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
        </section>

        {/* Features Section */}
        <section className="relative bg-background py-20 sm:py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-surface/30 px-3 py-1 text-[10px] sm:text-xs text-indigo-400 font-mono uppercase tracking-widest mb-5">
                What you get
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1]">
                Built with care.
                <br />
                <span className="text-muted-foreground">Priced with respect.</span>
              </h2>
            </motion.div>

            <div className="mt-12 sm:mt-16 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  className="group relative flex flex-col rounded-2xl sm:rounded-3xl border border-border/40 bg-surface/20 backdrop-blur-xl p-5 sm:p-7 hover:bg-surface/40 hover:border-border/80 hover:scale-[1.02] transition-all duration-400 cursor-default"
                >
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100 pointer-events-none" />

                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 grid place-items-center transition-all duration-400 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40">
                    <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 transition-colors duration-300 group-hover:text-indigo-300" />
                  </div>
                  <h3 className="mt-5 sm:mt-6 text-base sm:text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-border/50 bg-surface/30 backdrop-blur-lg p-8 sm:p-14 md:p-20 text-center shadow-2xl"
          >
            <div
              className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"
              aria-hidden
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-white drop-shadow-md">
              Ready when you are.
            </h2>
            <p className="mt-4 sm:mt-5 max-w-md mx-auto text-sm sm:text-base text-muted-foreground">
              Create a free account and start exploring the library today.
            </p>
            <Link
              to="/auth"
              className="mt-7 sm:mt-9 inline-flex h-11 sm:h-13 items-center justify-center gap-2 rounded-full bg-white px-8 sm:px-10 text-sm sm:text-base font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] active:scale-95"
            >
              Get started
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
