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
 *   /api/auth/me     → GET  /v1/portal/auth/me
 *   /api/auth/logout → POST /v1/portal/auth/logout
 *   /api/auth/login  → POST /v1/portal/auth/login
 *
 *   /api/publishers/onboard           → POST /v1/portal/publishers
 *   /api/publishers/me                → GET  /v1/portal/publishers/me
 *   /api/publishers/me/regenerate-key → POST /v1/portal/publishers/me/regenerate-key
 *   /api/reporting/stats              → GET  /v1/portal/publishers/me/stats
 *   /api/reporting/integration-status → GET  /v1/portal/publishers/me/integration-status
 *
 *   All other calls (signup, resend-verification) go directly to the API
 *   because they don't require an existing session cookie.
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
  /**
   * POST /api/publishers/onboard — same-origin proxy to POST /v1/portal/publishers
   * Onboard + provision API key (shown once).
   */
  create: (p: OnboardPayload) =>
    portalRequest<PublisherRecord>("/api/publishers/onboard", {
      method: "POST",
      body: JSON.stringify(p),
    }),

  /**
   * GET /api/publishers/me — same-origin proxy to GET /v1/portal/publishers/me
   * Returns masked key. Browser can't send portal cookie cross-origin.
   */
  me: () => portalRequest<PublisherRecord>("/api/publishers/me"),

  /**
   * POST /api/publishers/me/regenerate-key — same-origin proxy
   * Rotates key, returns new full key once.
   */
  regenerateKey: () =>
    portalRequest<{ publisher_id: string; api_key: string; api_key_prefix: string }>(
      "/api/publishers/me/regenerate-key",
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
  /**
   * GET /api/reporting/stats — same-origin proxy to GET /v1/portal/publishers/me/stats
   * Browser can't send portal cookie cross-origin to the API.
   */
  stats: (params?: { start_date?: string; end_date?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
    return portalRequest<StatsResponse>(
      `/api/reporting/stats${qs ? `?${qs}` : ""}`
    );
  },

  /**
   * GET /api/reporting/integration-status — same-origin proxy
   * to GET /v1/portal/publishers/me/integration-status
   */
  integrationStatus: () =>
    portalRequest<IntegrationStatusResponse>("/api/reporting/integration-status"),
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

// ── Advertiser self-service portal API (SPEC-A1 through SPEC-A4) ──────────────
//
// All calls go through same-origin proxy routes — the session cookie is on the
// portal domain and cannot be sent cross-origin to ambient-api.fly.dev.
// Proxy pattern: /api/advertisers/... → /v1/portal/advertisers/me/...
//

import type {
  AdvertiserRecord,
  AdvertiserCampaign,
  CreateCampaignPayload as AdvertiserCreateCampaignPayload,
  AdvertiserStats,
  AdvertiserReportResponse,
} from "@/types";

/** Shared fetch wrapper for advertiser portal proxy routes */
async function advertiserRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? "UNKNOWN", body?.message ?? res.statusText, body?.errors);
  }
  return res.json() as Promise<T>;
}

export const portalAdvertisers = {
  /** SPEC-A1: upsert advertiser profile */
  onboard: (p: {
    company_website: string;
    industry: string;
    monthly_budget_bracket: string;
    billing_contact_name: string;
    billing_email: string;
    company_address: string;
  }) =>
    advertiserRequest<{ advertiser_id: string; status: string }>(
      "/api/advertisers/onboard",
      { method: "POST", body: JSON.stringify(p) }
    ),

  /** SPEC-A1: get own advertiser profile — 404 if not onboarded yet */
  me: () => advertiserRequest<AdvertiserRecord>("/api/advertisers/me"),
};

export const portalAdvertiserCampaigns = {
  /** SPEC-A2: list campaigns with live metrics */
  list: () =>
    advertiserRequest<{ campaigns: AdvertiserCampaign[] }>(
      "/api/advertisers/campaigns"
    ),

  /** SPEC-A2: get campaign detail with live metrics */
  get: (id: string) =>
    advertiserRequest<AdvertiserCampaign>(`/api/advertisers/campaigns/${id}`),

  /** SPEC-A2: create campaign (auto-approved to active) */
  create: (p: AdvertiserCreateCampaignPayload) =>
    advertiserRequest<{ campaign_id: string; name: string; status: string; created_at: string }>(
      "/api/advertisers/campaigns",
      { method: "POST", body: JSON.stringify(p) }
    ),

  /** SPEC-A2: update mutable campaign fields */
  update: (id: string, p: Partial<Pick<AdvertiserCampaign, "name" | "headline" | "body" | "cta_text" | "destination_url" | "keywords" | "topics" | "daily_cap_usd" | "end_date">>) =>
    advertiserRequest<AdvertiserCampaign>(`/api/advertisers/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),

  /** SPEC-A2: pause campaign */
  pause: (id: string) =>
    advertiserRequest<{ status: string }>(
      `/api/advertisers/campaigns/${id}/pause`,
      { method: "POST" }
    ),

  /** SPEC-A2: resume paused campaign */
  resume: (id: string) =>
    advertiserRequest<{ status: string }>(
      `/api/advertisers/campaigns/${id}/resume`,
      { method: "POST" }
    ),
};

export const portalAdvertiserReporting = {
  /** SPEC-A3: dashboard summary */
  stats: (params?: { start_date?: string; end_date?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
    return advertiserRequest<AdvertiserStats>(
      `/api/advertisers/stats${qs ? `?${qs}` : ""}`
    );
  },

  /** SPEC-A4: daily rows by campaign */
  reports: (params?: { start_date?: string; end_date?: string; campaign_id?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
    return advertiserRequest<AdvertiserReportResponse>(
      `/api/advertisers/reports${qs ? `?${qs}` : ""}`
    );
  },

  /** SPEC-A4: CSV export — triggers browser download */
  exportCsv: (params?: { start_date?: string; end_date?: string; campaign_id?: string }) => {
    const p: Record<string, string> = { format: "csv", ...(params ?? {}) };
    const qs = new URLSearchParams(p).toString();
    // Navigate directly — browser handles Content-Disposition download
    window.location.assign(`/api/advertisers/reports?${qs}`);
  },
};
