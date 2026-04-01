import dns from "node:dns/promises";
import net from "node:net";

function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    const a = p[0]!;
    const b = p[1]!;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("::ffff:")) {
      const v4 = lower.slice(7);
      if (net.isIPv4(v4)) return isPrivateOrReservedIp(v4);
    }
    return false;
  }
  return true;
}

/**
 * Validates URL scheme/host and ensures DNS does not resolve to private/reserved IPs (basic SSRF guard).
 */
export async function assertUrlSafeForServerFetch(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new Error("Invalid job posting URL.");
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed.");
  }

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("Invalid host.");
  }

  if (net.isIPv4(host) || net.isIPv6(host)) {
    if (isPrivateOrReservedIp(host)) {
      throw new Error("URL must not point to a private network address.");
    }
    return u;
  }

  try {
    const results = await dns.lookup(host, { all: true });
    for (const { address } of results) {
      if (isPrivateOrReservedIp(address)) {
        throw new Error("URL resolves to a non-public address.");
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("non-public")) throw e;
    throw new Error("Could not resolve job posting host.");
  }

  return u;
}
