import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

// Lazy load DotField so it never runs during SSR
const DotField = lazy(() => import("@/components/ui/DotField"));

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(72);
const nameSchema = z.string().trim().min(1).max(100);

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Mahadevi Computers" },
      { name: "description", content: "Sign in or create your Mahadevi Computers account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });

  // Only render canvas-based background after hydration
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: (next ?? "/dashboard") as string });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (next ?? "/dashboard") as string });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      const parsedPassword = passwordSchema.parse(password);

      if (mode === "signup") {
        const parsedName = nameSchema.parse(fullName);
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsedName },
          },
        });
        if (error) throw error;
        if (!signUpData.session) {
          toast.success("Account created. Check your email to confirm your address, then sign in.");
          setMode("signin");
          setPassword("");
          return;
        }
        toast.success("Account created. Redirecting…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
        toast.success("Signed in");
      }
      navigate({ to: (next ?? "/dashboard") as string });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + (next ? next : "/dashboard"),
      },
    });
    if (error) {
      toast.error(error.message || "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* DotField — only rendered client-side after hydration */}
      {isClient && (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <DotField
              dotRadius={3.5}
              dotSpacing={7}
              bulgeStrength={98}
              glowRadius={240}
              sparkle={false}
              waveAmplitude={0}
              cursorRadius={650}
              cursorForce={0.14}
              gradientFrom="rgba(255, 255, 255, 0.55)"
              gradientTo="rgba(255, 255, 255, 0.18)"
              glowColor="#0d0b14"
            />
          </Suspense>
        </div>
      )}
      {/* Gradient overlay for form readability */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background/95 pointer-events-none" />

      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-md px-6 pt-36 pb-24 min-h-screen flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border/40 bg-surface/30 backdrop-blur-xl p-8 shadow-2xl"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Welcome
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tighter">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access purchased resources, wishlists, and downloads.
            </p>

            <div className="mt-7 space-y-4">
              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-full bg-surface/40 backdrop-blur-sm border-border/60 hover:bg-surface/70 transition-all duration-300"
                onClick={handleGoogle}
                disabled={busy}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-3 text-xs text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email / Password */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1.5 h-11 bg-surface/30 backdrop-blur-sm border-border/60"
                      required
                      maxLength={100}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 bg-surface/30 backdrop-blur-sm border-border/60"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 h-11 bg-surface/30 backdrop-blur-sm border-border/60"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-full mt-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={busy}
                >
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
