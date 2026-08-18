/**
 * useAuth — thin hook that fetches the current portal session.
 *
 * Uses GET /v1/portal/auth/me (cookie-authenticated).
 * Returns { user, loading, error } — pages can read role, full_name, etc.
 * On 401 the middleware will have already redirected; this is belt-and-suspenders.
 */
"use client";

import { useState, useEffect } from "react";
import { portalAuth, MeResponse, ApiError } from "@/lib/api/client";

export interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    portalAuth
      .me()
      .then((u) => { if (!cancelled) setUser(u); })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          // Session expired — middleware missed it (cookie present but revoked).
          // Redirect to login.
          window.location.href = "/login?expired=true";
        } else {
          setError(err instanceof Error ? err.message : "Session error");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { user, loading, error };
}
