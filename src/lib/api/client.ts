/**
 * Ambient Portal API Client
 * Thin wrapper over Core's REST endpoints.
 * Base URL pulled from env — falls back to localhost for dev.
 * All methods throw on non-2xx; callers handle errors.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
export interface SignupPayload {
  full_name: string;
  email: string;
  company_name: string;
  password: string;
  roles: ("advertiser" | "publisher")[];
}

export interface LoginPayload { email: string; password: string; }
export interface AuthResponse { token: string; user_id: string; roles: string[]; }

export const auth = {
  signup: (p: SignupPayload) =>
    request<AuthResponse>("/v1/auth/signup", { method: "POST", body: JSON.stringify(p) }),
  login: (p: LoginPayload) =>
    request<AuthResponse>("/v1/auth/login", { method: "POST", body: JSON.stringify(p) }),
  verifyEmail: (token: string) =>
    request<void>(`/v1/auth/verify-email?token=${token}`, { method: "POST" }),
};

// ---------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------
import type { Campaign, CampaignStats, ReportRow } from "@/types";

export type CreateCampaignPayload = Omit<Campaign, "id" | "status" | "created_at" | "updated_at" | "rejection_reason">;
export type UpdateCampaignPayload = Partial<CreateCampaignPayload> & { status?: "paused" | "active" };

export const campaigns = {
  list: (token: string) =>
    request<Campaign[]>("/v1/campaigns", { headers: { Authorization: `Bearer ${token}` } }),

  get: (token: string, id: string) =>
    request<Campaign>(`/v1/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

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
    request<CampaignStats>(`/v1/campaigns/${id}/stats${dateRange ? `?range=${dateRange}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  report: (token: string, params?: { campaign_id?: string; range?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<ReportRow[]>(`/v1/reporting/advertiser${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ---------------------------------------------------------------
// Publishers
// ---------------------------------------------------------------
import type { Publisher, PublisherStats } from "@/types";

export interface CreatePublisherPayload {
  app_name: string;
  app_url: string;
  app_category: string;
  integration_type: "gpt_store_custom_gpt" | "standalone_web_chatbot" | "other";
  monthly_active_users_range: string;
}

export const publishers = {
  get: (token: string) =>
    request<Publisher>("/v1/publishers/me", { headers: { Authorization: `Bearer ${token}` } }),

  create: (token: string, p: CreatePublisherPayload) =>
    request<{ publisher: Publisher; api_key: string }>("/v1/publishers", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(p),
    }),

  regenerateKey: (token: string) =>
    request<{ api_key: string }>("/v1/publishers/me/regenerate-key", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  stats: (token: string, range?: string) =>
    request<PublisherStats>(`/v1/reporting/publisher${range ? `?range=${range}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  report: (token: string, range?: string) =>
    request<import("@/types").ReportRow[]>(`/v1/reporting/publisher/daily${range ? `?range=${range}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
