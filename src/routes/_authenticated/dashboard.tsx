import { useState, useEffect, lazy, Suspense } from "react";

const ShapeGrid = lazy(() => import("@/components/ui/ShapeGrid"));
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Download } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-auth";
import { getResourceDownloadUrl } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mahadevi Computers" },
      { name: "description", content: "Your resources, purchases, and downloads." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  
  const { isAdmin } = useUserRole();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return { ...data, email: u.user.email };
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const { data } = await supabase
        .from("purchases")
        .select("*, resources(title, slug, thumbnail_url)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: wishlist } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("resource_id, resources(title, slug, thumbnail_url)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {isClient && (
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-30">
          <Suspense fallback={null}>
            <ShapeGrid 
              speed={0.38}
              squareSize={40}
              direction="diagonal"
              borderColor="rgba(255, 255, 255, 0.15)"
              hoverFillColor="rgba(255, 255, 255, 0.05)"
              shape="hexagon"
              hoverTrailAmount={5}
            />
          </Suspense>
        </div>
      )}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background/95 pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pt-32 pb-24 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Account</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tighter">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="rounded-full">Admin</Button>
              </Link>
            )}
            <Button variant="outline" className="rounded-full" onClick={handleSignOut}>Sign out</Button>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <StatCard label="Purchases" value={purchases?.length ?? 0} />
          <StatCard label="Wishlist" value={wishlist?.length ?? 0} />
          <StatCard label="Downloads" value={0} />
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Your library</h2>
          {purchases && purchases.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {purchases.map((p) => (
                <PurchaseCard key={p.id} purchase={p} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center bg-surface/50">
              <p className="text-muted-foreground mb-4">
                You haven't bought anything yet.
              </p>
              <Link to="/resources">
                <Button className="rounded-full">
                  See all courses
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
      </div>
    </div>
  );
}

type PurchaseRow = {
  id: string;
  amount_inr: number;
  resource_id: string;
  resources: { title: string; slug: string; thumbnail_url: string | null } | null;
};

function PurchaseCard({ purchase }: { purchase: PurchaseRow }) {
  const getDownload = useServerFn(getResourceDownloadUrl);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const { url } = await getDownload({ data: { resourceId: purchase.resource_id } });
      window.open(url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border p-4 hover:bg-surface transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium">{purchase.resources?.title}</div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest shrink-0">
          <CheckCircle2 className="h-3 w-3" /> Purchased
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">₹{purchase.amount_inr} · Access forever</div>
      <div className="mt-3 flex gap-2">
        {purchase.resources?.slug && (
          <Link to="/resources/$slug" params={{ slug: purchase.resources.slug }}>
            <Button variant="outline" size="sm" className="rounded-full">View</Button>
          </Link>
        )}
        <Button size="sm" className="rounded-full" onClick={handleDownload} disabled={busy}>
          <Download className="h-3.5 w-3.5 mr-1" /> {busy ? "Preparing…" : "Download"}
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tighter">{value}</div>
    </div>
  );
}
