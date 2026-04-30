/**
 * Edge-safe SHA-256 hex digest for privacy-preserving IP storage.
 */
export async function hashIpForAnalytics(rawIp: string, salt: string): Promise<string> {
  const normalized = rawIp.trim() || "unknown";
  const payload = `${salt}\n${normalized}`;
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
