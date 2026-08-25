// ---------------------------------------------------------------
// Shared domain types — mirrors Core API contract
// (PLANS/AMBIENT_ARCHITECTURE_V1.md Section 8)
// ---------------------------------------------------------------

export type CampaignStatus =
  | "active"
  | "paused"
  | "ended"
  | "scheduled"
  | "rejected"
  | "pending_review";

export type IntegrationStatus = "live" | "degraded" | "no_signal" | "not_integrated";

// Advertiser category includes conditional (legal, finance) and blocked categories
export type AdvertiserCategory =
  | "cpg"
  | "retail"
  | "finance"
  | "tech"
  | "travel"
  | "education"
  | "entertainment"
  | "food_beverage"
  | "productivity"
  | "marketing"
  | "legal_services"   // conditional — requires manual review
  | "healthcare"       // conditional — check w/ Warden
  | "other";

// Blocked categories — cannot proceed in wizard
export const BLOCKED_CATEGORIES = new Set([
  "pharma_rx",
  "securities",
  "gambling",
  "cannabis",
  "political",
  "adult",
] as const);

// Conditional categories — route to manual review queue
export const CONDITIONAL_CATEGORIES = new Set<AdvertiserCategory>([
  "legal_services",
  "finance",
  "healthcare",
]);

export const LEGAL_SERVICES_CATEGORY: AdvertiserCategory = "legal_services";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  advertiser_category: AdvertiserCategory;
  creative: {
    headline: string;
    body: string;
    cta_text: string;
    destination_url: string;
  };
  targeting: {
    topics: string[];
    keywords: string[];
    excluded_topics: string[];
  };
  budget: {
    total_usd: number;
    cpm_usd: number;
    daily_cap_usd?: number;
  };
  flight: {
    start_date: string; // YYYY-MM-DD
    end_date: string;
  };
  legal_self_certification?: boolean; // required for legal_services
  rejection_reason?: string; // populated on status=rejected
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  campaign_id: string;
  impressions: number;
  clicks: number;
  ctr: number; // 0–1
  spend_usd: number;
}

export interface Publisher {
  id: string;
  app_name: string;
  app_url: string;
  app_category: string;
  integration_type: "gpt_store_custom_gpt" | "standalone_web_chatbot" | "other";
  monthly_active_users_range: string;
  integration_status: IntegrationStatus;
  last_event_at?: string;
  api_key_masked: string; // e.g. "amb_live_xxxx...3f9a"
  created_at: string;
}

export interface PublisherStats {
  publisher_id: string;
  impressions: number;
  clicks: number;
  ctr: number;
  estimated_earnings_usd: number;
}

export interface ReportRow {
  date: string;
  campaign_id?: string;
  campaign_name?: string;
  publisher_id?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend_usd: number;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  roles: ("advertiser" | "publisher")[];
}

// ── Advertiser self-service API types (SPEC-A1 through SPEC-A4) ───────────────

export type AdvertiserIndustry =
  | "cpg" | "retail" | "finance" | "tech" | "education" | "health" | "other";

export type AdvertiserBudgetBracket = "lt_5k" | "5k_25k" | "gt_25k";

/** SPEC-A1: advertiser profile returned by GET /v1/portal/advertisers/me */
export interface AdvertiserRecord {
  advertiser_id: string;
  company_name: string;
  company_website: string;
  industry: AdvertiserIndustry;
  monthly_budget_bracket: AdvertiserBudgetBracket;
  billing_contact_name: string;
  billing_email: string;
  company_address: string;
  status: "active" | "pending";
}

/** SPEC-A2: campaign as returned by GET /v1/portal/advertisers/me/campaigns */
export interface AdvertiserCampaign {
  campaign_id: string;
  name: string;
  headline: string;
  body: string;
  cta_text: string;
  destination_url: string;
  keywords: string[];
  topics: string[];
  total_budget_usd: number;
  cpm_usd: number;
  daily_cap_usd?: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  status: "active" | "paused" | "ended" | "draft";
  // live metrics (present on list + detail responses)
  spend_usd: number;
  impressions: number;
  clicks: number;
  ctr: number;
  created_at: string;
}

/** SPEC-A2: POST /v1/portal/advertisers/me/campaigns request body */
export interface CreateCampaignPayload {
  name: string;
  headline: string;
  body: string;
  cta_text?: string;
  destination_url: string;
  keywords?: string[];
  topics?: string[];
  total_budget_usd: number;
  cpm_usd: number;
  daily_cap_usd?: number;
  start_date: string;
  end_date: string;
}

/** SPEC-A3: GET /v1/portal/advertisers/me/stats response */
export interface AdvertiserStats {
  advertiser_id: string;
  start_date: string;
  end_date: string;
  summary: {
    active_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    overall_ctr: number;
    total_spend_usd: number;
  };
  by_campaign: Array<{
    campaign_id: string;
    name: string;
    impressions: number;
    clicks: number;
    ctr: number;
    spend_usd: number;
    status: string;
  }>;
}

/** SPEC-A4: GET /v1/portal/advertisers/me/reports response */
export interface AdvertiserReportRow {
  date: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend_usd: number;
}

export interface AdvertiserReportResponse {
  summary: {
    total_impressions: number;
    total_clicks: number;
    overall_ctr: number;
    total_spend_usd: number;
  };
  rows: AdvertiserReportRow[];
}
