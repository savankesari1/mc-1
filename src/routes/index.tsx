import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Download, PlayCircle, Code, Terminal, Zap } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Antigravity } from "@/components/ui/Antigravity";
import { useRef } from "react";

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

// Staggered text variants for the Hero title
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
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

function Home() {
  return (
    <div className="bg-background relative selection:bg-accent/30 selection:text-accent-foreground">
      <Header />
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden pt-20 border-b border-border">
          {/* Interactive Antigravity Background */}
          <div className="absolute inset-0 z-0">
            <Antigravity
              count={300}
              magnetRadius={10}
              ringRadius={10}
              waveSpeed={0.4}
              waveAmplitude={1}
              particleSize={2}
              lerpSpeed={0.1}
              color="#6366f1"
              autoAnimate={false}
              particleVariance={1}
              depthFactor={1}
              particleShape="box"
              fieldStrength={10}
            />
          </div>

          {/* Vignette/Gradient Overlays to blend edges and ensure text readability */}
          <div className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/40 to-background/90" />
          <div className="absolute bottom-0 left-0 right-0 h-40 z-[5] bg-gradient-to-t from-background to-transparent" />

          <motion.div 
            className="relative z-10 mx-auto max-w-5xl px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface/30 px-4 py-1.5 text-xs sm:text-sm text-foreground/80 backdrop-blur-md shadow-xl"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="font-medium tracking-wide">Introducing Mahadevi — premium learning, simplified</span>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col items-center"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[1.05]"
              >
                Learn without limits.
              </motion.h1>
              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-2xl leading-[1.1] mt-2"
              >
                Built for serious students.
              </motion.h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease }}
              className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed drop-shadow-md"
            >
              A hand-curated library of computer training, programming, and
              competitive-exam resources. No clutter. No distractions. Just the
              material you need to move forward.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.8, ease }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/resources"
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Browse resources
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                {/* Button hover gradient effect */}
                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shimmer" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/50 bg-surface/20 backdrop-blur-sm px-8 font-medium text-foreground transition-all hover:bg-surface/50 hover:text-white w-full sm:w-auto"
              >
                Learn more
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Categories marquee */}
        <section className="border-b border-border py-8 overflow-hidden bg-background relative z-20">
          <div className="flex gap-12 whitespace-nowrap animate-[marquee_50s_linear_infinite]">
            {[...categories, ...categories, ...categories].map((c, i) => (
              <span
                key={i}
                className="font-mono text-sm uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-foreground cursor-default"
              >
                {c} <span className="ml-12 text-border">/</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
        </section>

        {/* Features Section - Glassmorphism & Reveal */}
        <section className="relative bg-background py-32 overflow-hidden">
          {/* Subtle background glow for the features section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-surface/30 px-3 py-1 text-xs text-indigo-400 font-mono uppercase tracking-widest mb-6">
                What you get
              </div>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[1.1]">
                Built with care.
                <br />
                <span className="text-muted-foreground">Priced with respect.</span>
              </h2>
            </motion.div>

            <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease }}
                  className="group relative flex flex-col rounded-3xl border border-border/40 bg-surface/20 backdrop-blur-xl p-8 hover:bg-surface/40 hover:border-border/80 transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                  
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 grid place-items-center transition-transform duration-500 group-hover:scale-110 group-hover:bg-indigo-500/20">
                    <f.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="mt-8 text-xl font-medium text-white">{f.title}</h3>
                  <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mx-auto max-w-5xl px-6 pb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-surface/30 backdrop-blur-lg p-12 md:p-24 text-center shadow-2xl"
          >
            <div
              className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"
              aria-hidden
            />
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white drop-shadow-md">
              Ready when you are.
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-lg text-muted-foreground">
              Create a free account and start exploring the library today.
            </p>
            <Link
              to="/auth"
              className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-10 text-base font-medium text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Get started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

