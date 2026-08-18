/**
 * /verify-email — handles two scenarios:
 *
 * 1. API redirects here after successful verification: /verify-email
 *    (no query params) → should not happen; Core redirects to /login?verified=true
 *
 * 2. API redirects here on error:
 *    /verify-email?error=missing  — token param absent
 *    /verify-email?error=invalid  — token already used or not found
 *    /verify-email?error=expired  — token past 24h window
 *
 * The verify-email GET endpoint on Core does a server-side redirect
 * (302 → /login?verified=true on success, or /verify-email?error=X on failure).
 * So this page only renders error states; successful verification lands on /login.
 */
"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

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
  const errorCode = searchParams.get("error") ?? "";
  const errorInfo = ERROR_MESSAGES[errorCode];

  // No error param — user landed here directly; redirect to signup
  if (!errorCode) {
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

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-page)] p-4">
      <Suspense fallback={<div className="w-full max-w-sm h-40 animate-pulse" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
