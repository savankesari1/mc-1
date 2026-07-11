import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Returns the public Razorpay key_id so the browser can open Checkout. */
export const getRazorpayKey = createServerFn({ method: "GET" }).handler(async () => {
  return { keyId: process.env.RAZORPAY_KEY_ID ?? "" };
});

/** Creates a Razorpay order for a resource the user is trying to buy. */
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { resourceId: string }) =>
    z.object({ resourceId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Use service-role admin client for writes so we're not blocked by RLS gaps
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch resource (user-scoped is fine for reads)
    const { data: resource, error: rErr } = await supabase
      .from("resources")
      .select("id, title, price_inr, is_free, is_published")
      .eq("id", data.resourceId)
      .maybeSingle();
    if (rErr || !resource) throw new Error("Resource not found");
    if (!resource.is_published) throw new Error("Resource unavailable");
    if (resource.is_free || resource.price_inr <= 0) throw new Error("Resource is free — no payment needed");

    // Check if user already purchased this resource
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id, status")
      .eq("resource_id", data.resourceId)
      .eq("user_id", userId)
      .eq("status", "completed")
      .maybeSingle();
    if (existing) throw new Error("You have already purchased this resource");

    const amountPaise = Math.round(Number(resource.price_inr) * 100);

    // Insert pending purchase via admin to avoid RLS write restrictions
    const { data: purchase, error: pErr } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: userId,
        resource_id: resource.id,
        amount_inr: resource.price_inr,
        status: "pending",
      })
      .select()
      .single();
    if (pErr) throw pErr;

    // Validate Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay is not configured on the server");

    // Debug: log key prefix so we can confirm live vs test in server logs
    console.log("[Razorpay] Using key:", keyId.slice(0, 14) + "...");

    // Create Razorpay order
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: purchase.id,
        notes: { purchase_id: purchase.id, resource_id: resource.id },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Razorpay API error (key: ${keyId.slice(0, 14)}...): ${text.slice(0, 300)}`);
    }
    const order = (await res.json()) as { id: string };

    // Store the Razorpay order ID on the purchase record (admin bypass)
    await supabaseAdmin
      .from("purchases")
      .update({ razorpay_order_id: order.id })
      .eq("id", purchase.id);

    return {
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      purchaseId: purchase.id,
      keyId,
      resourceTitle: resource.title,
    };
  });

/** Verifies Razorpay signature and marks purchase completed. */
export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    purchaseId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    z
      .object({
        purchaseId: z.string().uuid(),
        razorpay_order_id: z.string().min(1),
        razorpay_payment_id: z.string().min(1),
        razorpay_signature: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay not configured on the server");

    // Verify HMAC signature
    const { createHmac } = await import("crypto");
    const expected = createHmac("sha256", secret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    if (expected !== data.razorpay_signature) throw new Error("Payment signature verification failed");

    // Use admin to update purchase status (bypasses RLS)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("purchases")
      .update({
        status: "completed",
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      })
      .eq("id", data.purchaseId)
      .eq("user_id", context.userId); // extra safety: ensure the purchase belongs to this user
    if (error) throw error;
    return { ok: true };
  });

/** Returns a short-lived signed URL to view/download a purchased resource file. */
export const getResourceDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { resourceId: string }) =>
    z.object({ resourceId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Validate the service-role key early to give a clear error
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your .env file.");
    }

    const { data: resource } = await supabase
      .from("resources")
      .select("id, file_path, external_url, is_free, price_inr")
      .eq("id", data.resourceId)
      .maybeSingle();

    if (!resource) throw new Error("Resource not found");

    // Check entitlement for paid resources
    if (!resource.is_free && Number(resource.price_inr) > 0) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("resource_id", data.resourceId)
        .eq("user_id", userId)
        .eq("status", "completed")
        .maybeSingle();
      if (!purchase) throw new Error("You haven't purchased this resource yet");
    }

    // If resource is an external URL (YouTube, Drive, etc.) return it directly
    if (resource.external_url && !resource.file_path) {
      await supabase.from("downloads").insert({ resource_id: data.resourceId, user_id: userId });
      return { url: resource.external_url, type: "external" as const };
    }

    if (!resource.file_path) throw new Error("No file has been attached to this resource yet");

    // Use service-role admin client to create a signed URL
    // (the resource-files bucket is private; RLS only allows admin reads)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("resource-files")
      .createSignedUrl(resource.file_path, 60 * 30); // 30-minute window
    if (error || !signed) throw error ?? new Error("Could not generate download link");

    // Log the download
    await supabase.from("downloads").insert({ resource_id: data.resourceId, user_id: userId });

    // Determine file type for viewer hint
    const ext = resource.file_path.split(".").pop()?.toLowerCase() ?? "";
    const isPdf = ext === "pdf";

    return { url: signed.signedUrl, type: isPdf ? ("pdf" as const) : ("file" as const) };
  });
