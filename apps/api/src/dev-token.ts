import { createHmac, randomUUID } from "node:crypto";
import { userRoleSchema, type UserRole } from "@cascadia/contracts";
import { Pool } from "pg";
import { loadConfig } from "./config.js";

const config = loadConfig();
if (config.NODE_ENV === "production") throw new Error("Local access tokens cannot be issued in production.");
if (!config.DATABASE_URL) throw new Error("DATABASE_URL is required to select a local organization.");
const role: UserRole = userRoleSchema.parse(process.argv[3] ?? "organization_admin");
const pool = new Pool({ connectionString: config.DATABASE_URL });
try {
  const requestedOrganizationId = process.argv[2];
  const result = requestedOrganizationId
    ? await pool.query("SELECT id,name FROM organizations WHERE id=$1", [requestedOrganizationId])
    : await pool.query("SELECT id,name FROM organizations ORDER BY created_at DESC LIMIT 1");
  const organization = result.rows[0] as { id: string; name: string } | undefined;
  if (!organization) throw new Error(requestedOrganizationId ? "The requested organization does not exist." : "No organization exists. Onboard one before creating a local token.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: randomUUID(), organizationId: organization.id, role, iat: now, exp: now + 8 * 60 * 60 });
  const signature = createHmac("sha256", config.JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  process.stdout.write(`Organization: ${organization.name} (${organization.id})\nRole: ${role}\nExpires: ${new Date((now + 8 * 60 * 60) * 1000).toISOString()}\n\n${header}.${payload}.${signature}\n`);
} finally {
  await pool.end();
}
