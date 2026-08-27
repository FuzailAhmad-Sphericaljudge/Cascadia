import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default("127.0.0.1"),
  JWT_SECRET: z.string().min(32),
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32).optional(),
  DATA_STORE: z.enum(["memory", "postgres"]).default("memory"),
  DATABASE_URL: z.string().url().optional(),
  PUBLIC_APP_URL: z.string().url().default("http://127.0.0.1:5173"),
  OIDC_ISSUER_URL: z.string().url().optional(),
  OIDC_CLIENT_ID: z.string().min(1).optional(),
  OIDC_CLIENT_SECRET: z.string().min(16).optional(),
  OIDC_MFA_AMR_VALUES: z.string().default("mfa,otp,hwk,fido,webauthn"),
  OIDC_MFA_ACR_VALUES: z.string().default(""),
  SESSION_TTL_MINUTES: z.coerce.number().int().min(5).max(720).default(480),
  OBSERVABILITY_TOKEN: z.string().min(32).optional(),
  NOTIFICATION_WEBHOOK_URL: z.url().refine((value) => new URL(value).protocol === "https:", "Notification webhook URL must use HTTPS.").optional(),
  NOTIFICATION_WEBHOOK_PROVIDER: z.enum(["generic", "slack", "teams"]).optional(),
  REQUESTS_PER_MINUTE: z.coerce.number().int().min(30).max(10_000).default(300),
  SERVE_WEB: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  WEB_DIST_DIR: z.string().min(1).default("apps/web/dist"),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(3).default(0),
}).superRefine((config, context) => {
  if (config.DATA_STORE === "postgres" && !config.DATABASE_URL) {
    context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL is required for the PostgreSQL data store." });
  }
  if (config.NODE_ENV === "production" && config.DATA_STORE !== "postgres") {
    context.addIssue({ code: "custom", path: ["DATA_STORE"], message: "Production must use the PostgreSQL data store." });
  }
  if (config.NODE_ENV === "production" && !config.INTEGRATION_ENCRYPTION_KEY) {
    context.addIssue({ code: "custom", path: ["INTEGRATION_ENCRYPTION_KEY"], message: "Production requires a separate integration encryption key." });
  }
  const oidcValues = [config.OIDC_ISSUER_URL, config.OIDC_CLIENT_ID, config.OIDC_CLIENT_SECRET];
  if (oidcValues.some(Boolean) && !oidcValues.every(Boolean)) {
    context.addIssue({ code: "custom", path: ["OIDC_ISSUER_URL"], message: "OIDC issuer, client ID, and client secret must be configured together." });
  }
  if (config.NODE_ENV === "production" && !oidcValues.every(Boolean)) {
    context.addIssue({ code: "custom", path: ["OIDC_ISSUER_URL"], message: "Production requires an OIDC provider." });
  }
  if (config.NODE_ENV === "production" && (!config.PUBLIC_APP_URL.startsWith("https://") || !config.OIDC_ISSUER_URL?.startsWith("https://"))) {
    context.addIssue({ code: "custom", path: ["PUBLIC_APP_URL"], message: "Production application and OIDC issuer URLs must use HTTPS." });
  }
  if (config.NODE_ENV === "production" && !config.OBSERVABILITY_TOKEN) {
    context.addIssue({ code: "custom", path: ["OBSERVABILITY_TOKEN"], message: "Production requires a dedicated observability token." });
  }
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment);
}
