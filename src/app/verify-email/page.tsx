/**
 * /verify-email — handles email verification token flow.
 *
 * When a `token` query param is present (user clicked the link from email),
 * this page forwards the token to the API: GET /v1/portal/auth/verify-email?token=...
 * The API sets verified=true and redirects to /login?verified=true on success,
 * or back to /verify-email?error=<code> on failure.
 *
 * When an `error` query param is present (API redirected back after failure):
 *   /verify-email?error=missing  — token param absent
 *   /verify-email?error=invalid  — token already used or not found
 *   /verify-email?error=expired  — token past 24h window
 *
 * No params: user landed here directly — show "check your inbox" message.
 */
"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  missing: {
    title: "Invalid verification link",
    body: "This link is missing the verification token. Make sure you clicked the full link from your email.",
  },
  invalid: {
    title: "Link already used",
    body: "This verification link has already been used. If your email isn't verified, try signing up again or request a new link.",
  },
  expired: {
    title: "Link expired",
    body: "This verification link has expired. Links are valid for 24 hours. Request a new one from the login page.",
  },
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorCode = searchParams.get("error") ?? "";
  const errorInfo = ERROR_MESSAGES[errorCode];

  // Token present — forward to API which will redirect to /login?verified=true or back here with ?error=
  useEffect(() => {
    if (token) {
      window.location.href = `${BASE_URL}/v1/portal/auth/verify-email?token=${encodeURIComponent(token)}`;
    }
  }, [token]);

  if (token) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-[40px]">⏳</div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Verifying your email…</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)]">Just a moment.</p>
      </div>
    );
  }

  // Error from API redirect
  if (errorCode) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-[40px]">⚠️</div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">
          {errorInfo?.title ?? "Verification failed"}
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          {errorInfo?.body ?? "Something went wrong. Please try again."}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => { window.location.href = "/signup"; }}>Sign up again</Button>
          <Button variant="secondary" onClick={() => { window.location.href = "/login"; }}>Log in</Button>
        </div>
      </div>
    );
  }

  // No params — user landed here directly
  return (
    <div className="w-full max-w-sm text-center space-y-4">
      <div className="text-[40px]">📬</div>
      <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Verify your email</h1>
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        Click the link in your verification email to activate your account.
      </p>
      <Button variant="secondary" onClick={() => { window.location.href = "/login"; }}>
        Go to login
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-page)] p-4">
      <Suspense fallback={<div className="w-full max-w-sm h-40 animate-pulse" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
