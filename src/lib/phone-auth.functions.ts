import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Step 1: Send OTP via Twilio Verify ──────────────────────────────────────

/**
 * Triggers a Twilio Verify SMS OTP to the given Indian mobile number.
 * Twilio generates, stores, and expires the code automatically.
 */
export const sendPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string }) =>
    z
      .object({
        /** 10-digit Indian mobile number without country code, e.g. "9876543210" */
        phone: z
          .string()
          .trim()
          .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || authToken === "[AuthToken]" || !serviceSid) {
      throw new Error(
        "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SID in your .env file.",
      );
    }

    const { default: twilio } = await import("twilio");
    const client = twilio(accountSid, authToken);

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: `+91${data.phone}`, channel: "sms" });

    if (verification.status !== "pending") {
      throw new Error(`Unexpected Twilio status: ${verification.status}`);
    }

    return { ok: true };
  });

// ─── Step 2: Verify OTP + create Supabase session ────────────────────────────

/**
 * Checks the OTP with Twilio Verify.
 * On success, finds-or-creates the Supabase user and returns a
 * magic-link token_hash the client can exchange for a real session.
 */
export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string; code: string }) =>
    z
      .object({
        phone: z
          .string()
          .trim()
          .regex(/^[6-9]\d{9}$/, "Invalid phone number"),
        code: z.string().length(6, "OTP must be 6 digits"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || authToken === "[AuthToken]" || !serviceSid) {
      throw new Error("Twilio is not configured on the server.");
    }

    const { default: twilio } = await import("twilio");
    const client = twilio(accountSid, authToken);

    const e164 = `+91${data.phone}`;

    // Check code with Twilio Verify
    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: e164, code: data.code });

    if (check.status !== "approved") {
      throw new Error("Incorrect OTP. Please try again.");
    }

    // OTP approved — find or create the Supabase user for this phone
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const phoneEmail = `phone_${data.phone}@auth.mahadevi.internal`;

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === phoneEmail);

    if (!existing) {
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: phoneEmail,
        email_confirm: true,
        user_metadata: { phone: e164, auth_method: "phone_otp" },
      });
      if (createErr) throw new Error(`Failed to create account: ${createErr.message}`);
    }

    // Generate a magic-link token the client exchanges for a real session
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: phoneEmail,
    });
    if (linkErr || !linkData) throw new Error(`Failed to create session: ${linkErr?.message}`);

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) throw new Error("Session token missing from magic link response.");

    return { ok: true, tokenHash };
  });
