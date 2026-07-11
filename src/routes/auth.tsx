import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Phone, Mail, ArrowLeft, Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(72);
const nameSchema = z.string().trim().min(1).max(100);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

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

// ─── Phone OTP panel ────────────────────────────────────────────────────────

function PhoneAuthPanel({ next }: { next?: string }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${parsed.data}`,
      });
      if (error) throw error;
      toast.success("OTP sent to +91 " + parsed.data);
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    const token = otp.join("");
    if (token.length !== 6) {
      toast.error("Enter the complete 6-digit OTP");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Signed in successfully!");
      navigate({ to: (next ?? "/dashboard") as string });
    } catch (err) {
      toast.error((err as Error).message);
      // Clear OTP on failure
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setBusy(false);
    }
  }

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const next = [...otp];
    digits.forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    otpRefs.current[focusIdx]?.focus();
  }

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.div
          key="phone-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="phone-number">Mobile number</Label>
            <div className="mt-1.5 flex rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-ring">
              <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm font-mono border-r border-border select-none">
                🇮🇳 +91
              </span>
              <input
                id="phone-number"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                className="flex-1 h-11 px-3 bg-transparent text-sm outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              We'll send a 6-digit OTP via SMS
            </p>
          </div>
          <Button
            className="w-full h-11 rounded-full"
            onClick={sendOtp}
            disabled={busy || phone.length < 10}
          >
            {busy ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
            ) : (
              <><Phone className="h-4 w-4 mr-2" /> Send OTP</>
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="otp-step"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <p className="text-sm text-muted-foreground">
                OTP sent to <span className="text-foreground font-medium">+91 {phone}</span>
              </p>
            </div>

            <Label>Enter 6-digit OTP</Label>
            <div className="mt-2 flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full h-11 rounded-full"
            onClick={verifyOtp}
            disabled={busy || otp.join("").length < 6}
          >
            {busy ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…</>
            ) : (
              "Verify & Sign in"
            )}
          </Button>

          <button
            type="button"
            disabled={countdown > 0 || busy}
            onClick={() => { setOtp(["", "", "", "", "", ""]); setCountdown(30); sendOtp(); }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Didn't get it? Resend OTP"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main auth page ──────────────────────────────────────────────────────────

type AuthTab = "phone" | "email";

function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("phone");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });

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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: (next ?? "/dashboard") as string });
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-6 pt-40 pb-32 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Welcome
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tighter">Sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Access purchased resources, wishlists, and downloads.
          </p>

          <div className="mt-8 space-y-4">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-full"
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

            {/* Tab switcher */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Phone / Email tabs */}
            <div className="flex rounded-xl border border-border overflow-hidden p-1 gap-1 bg-muted/30">
              <button
                type="button"
                onClick={() => setTab("phone")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "phone"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => setTab("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "email"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {tab === "phone" ? (
                <motion.div
                  key="phone-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PhoneAuthPanel next={next} />
                </motion.div>
              ) : (
                <motion.div
                  key="email-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {mode === "signup" && (
                      <div>
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="mt-1.5 h-11"
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
                        className="mt-1.5 h-11"
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
                        className="mt-1.5 h-11"
                        required
                        minLength={8}
                        maxLength={72}
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-full" disabled={busy}>
                      {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                    </Button>
                  </form>

                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-3"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  >
                    {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
