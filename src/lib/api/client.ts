/**
 * Ambient Portal API Client
 * Thin wrapper over Core's REST endpoints.
 *
 * Auth model: HttpOnly cookie sessions (portal auth).
 *
 * IMPORTANT — same-origin proxy pattern:
 *   The session cookie is set on the PORTAL domain (ambient-portal.fly.dev)
 *   by /api/auth/login. Browsers cannot send that cookie to the API domain
 *   (ambient-api.fly.dev). Therefore auth-sensitive calls (me, logout) go
 *   through same-origin Next.js route handlers that read the cookie
 *   server-side and forward it as a Bearer token to the API.
 *
 *   /api/auth/me    → GET  /v1/portal/auth/me
 *   /api/auth/logout → POST /v1/portal/auth/logout
 *   /api/auth/login  → POST /v1/portal/auth/login
 *
 *   All other calls (publishers, reporting) use credentials:"include" with
 *   BASE_URL — those endpoints also need proxying if they return 401 in prod.
 *
 * Base URL pulled from env — falls back to localhost:8080 for dev.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── Core fetch wrapper ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",       // always send the session cookie
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let body: { error?: string; message?: string; errors?: Record<string, string> } = {};
    try { body = await res.json(); } catch { /* non-JSON error body */ }
    throw new ApiError(
      res.status,
      body.error ?? "UNKNOWN_ERROR",
      body.message ?? `API error ${res.status}`,
      body.errors
    );
  }

  return res.json() as Promise<T>;
}

/**
 * Same-origin request to portal-local Next.js route handlers (/api/auth/*).
 * Does NOT prefix with BASE_URL — path must be a relative /api/... path.
 * Used for auth calls that must go through the portal domain so the
 * HttpOnly cookie is accessible server-side.
 */
async function portalRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let body: { error?: string; message?: string; errors?: Record<string, string> } = {};
    try { body = await res.json(); } catch { /* non-JSON error body */ }
    throw new ApiError(
      res.status,
      body.error ?? "UNKNOWN_ERROR",
      body.message ?? `API error ${res.status}`,
      body.errors
    );
  }

  return res.json() as Promise<T>;
}

// ── Portal Auth ───────────────────────────────────────────────────────────────

export type PortalRole = "publisher" | "advertiser" | "both";

export interface SignupPayload {
  full_name: string;
  email: string;
  company_name: string;
  password: string;
  role: PortalRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
  role: PortalRole;
  status: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: PortalRole;
}

export interface MeResponse {
  user_id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: PortalRole;
  verified: boolean;
}

export const portalAuth = {
  /** POST /v1/portal/auth/signup — creates account + sends verification email */
  signup: (p: SignupPayload) =>
    request<SignupResponse>("/v1/portal/auth/signup", {
      method: "POST",
      body: JSON.stringify(p),
    }),

  /**
   * POST /api/auth/login — same-origin portal proxy (NOT direct to API).
   * The portal route handler calls the API, extracts the JWT, and sets the
   * cookie on the portal domain where middleware can read it.
   */
  login: (p: LoginPayload) =>
    portalRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(p),
    }),

  /**
   * GET /api/auth/me — same-origin portal proxy (NOT direct to API).
   * The portal route handler reads the cookie server-side and proxies
   * it to the API as a Bearer token. Cross-origin fetch can't send
   * the portal cookie to the API domain.
   */
  me: () => portalRequest<MeResponse>("/api/auth/me"),

  /**
   * POST /api/auth/logout — same-origin portal proxy (NOT direct to API).
   * Clears the cookie on the portal domain and notifies the API.
   */
  logout: () =>
    portalRequest<void>("/api/auth/logout", { method: "POST" }),

  /** POST /v1/portal/auth/resend-verification — always 204 (anti-enumeration) */
  resendVerification: (email: string) =>
    request<void>("/v1/portal/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// ── Portal Publishers ─────────────────────────────────────────────────────────

export type AppCategory =
  | "custom_gpt"
  | "standalone_chatbot"
  | "voice_ai"
  | "rag_app"
  | "other";

export type MauRange = "lt1k" | "1k_10k" | "10k_100k" | "100k_plus";
export type IntegrationType = "standalone_web_chatbot" | "other";

export interface OnboardPayload {
  app_name: string;
  app_url: string;
  app_category: AppCategory;
  mau_range: MauRange;
  integration_type: IntegrationType;
}

export interface PublisherRecord {
  publisher_id: string;
  name: string;
  contact_email: string;
  api_key_prefix: string;
  api_key_masked?: string; // only on GET /me
  api_key?: string;        // only on POST (shown once)
  status: "active" | "suspended";
  app_name: string;
  app_url: string;
  app_category: AppCategory;
  mau_range: MauRange;
  integration_type: IntegrationType;
  cpm_usd: number;
  created_at: string;
}

export const portalPublishers = {
  /** POST /v1/publishers — onboard + provision API key (shown once) */
  create: (p: OnboardPayload) =>
    request<PublisherRecord>("/v1/publishers", {
      method: "POST",
      body: JSON.stringify(p),
    }),

  /** GET /v1/publishers/me — returns masked key, not the full key */
  me: () => request<PublisherRecord>("/v1/publishers/me"),

  /** POST /v1/publishers/me/regenerate-key — rotates key, returns new full key once */
  regenerateKey: () =>
    request<{ publisher_id: string; api_key: string; api_key_prefix: string }>(
      "/v1/publishers/me/regenerate-key",
      { method: "POST" }
    ),
};

// ── Portal Reporting ──────────────────────────────────────────────────────────

export interface StatRow {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend_usd: number;
}

export interface StatsResponse {
  publisher_id: string;
  start_date: string;
  end_date: string;
  summary: {
    total_impressions: number;
    total_clicks: number;
    overall_ctr: number;
    total_spend_usd: number;
  };
  rows: StatRow[];
}

export interface IntegrationStatusResponse {
  publisher_id: string;
  integration_status: "live" | "no_signal" | "not_integrated";
  checked_at: string;
}

export const portalReporting = {
  /** GET /v1/portal/publishers/me/stats */
  stats: (params?: { start_date?: string; end_date?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<StatsResponse>(
      `/v1/portal/publishers/me/stats${qs ? `?${qs}` : ""}`
    );
  },

  /** GET /v1/portal/publishers/me/integration-status */
  integrationStatus: () =>
    request<IntegrationStatusResponse>("/v1/portal/publishers/me/integration-status"),
};

// ── Campaigns (advertiser — Bearer-based, separate auth path) ─────────────────
// NOTE: advertiser auth is still using the old admin-provisioned token path.
// This section is kept for backward compat with existing advertiser pages.
// Will migrate to portal-auth cookie sessions in a future PR.

import type { Campaign, CampaignStats, ReportRow } from "@/types";

export type CreateCampaignPayload = Omit<
  Campaign,
  "id" | "status" | "created_at" | "updated_at" | "rejection_reason"
>;
export type UpdateCampaignPayload = Partial<CreateCampaignPayload> & {
  status?: "paused" | "active";
};

export const campaigns = {
  list: (token: string) =>
    request<Campaign[]>("/v1/campaigns", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  get: (token: string, id: string) =>
    request<Campaign>(`/v1/campaigns/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token: string, p: CreateCampaignPayload) =>
    request<Campaign>("/v1/campaigns", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(p),
    }),

  update: (token: string, id: string, p: UpdateCampaignPayload) =>
    request<Campaign>(`/v1/campaigns/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(p),
    }),

  delete: (token: string, id: string) =>
    request<void>(`/v1/campaigns/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  stats: (token: string, id: string, dateRange?: string) =>
    request<CampaignStats>(
      `/v1/campaigns/${id}/stats${dateRange ? `?range=${dateRange}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  report: (token: string, params?: { campaign_id?: string; range?: string }) => {
    const qs = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return request<ReportRow[]>(
      `/v1/reporting/advertiser${qs ? `?${qs}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
