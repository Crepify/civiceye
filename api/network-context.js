/**
 * Identifies a configured campus network from the request's public egress IP.
 * Browsers intentionally do not expose the connected Wi-Fi SSID to web apps,
 * so the campus operator must configure its public IPv4 address or CIDR.
 */

function configuredRanges() {
  return [
    process.env.AMRITA_NETWORK_IPS,
    process.env.AMRITA_NETWORK_CIDRS,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((entry) => entry.trim()).filter(Boolean));
}

function clientIp(req) {
  return (
    req.headers?.['x-vercel-forwarded-for']
    || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers?.['x-real-ip']
    || ''
  ).trim().replace(/^\[|\]$/g, '');
}

function ipv4ToNumber(value) {
  const octets = value.split('.');
  if (octets.length !== 4 || octets.some((octet) => !/^\d+$/.test(octet))) return null;
  const numbers = octets.map(Number);
  if (numbers.some((octet) => octet < 0 || octet > 255)) return null;
  return numbers.reduce((result, octet) => (result * 256) + octet, 0) >>> 0;
}

function matchesRange(ip, range) {
  const [rawAddress, rawBits] = range.split('/');
  const address = ipv4ToNumber(rawAddress);
  const candidate = ipv4ToNumber(ip);
  if (address === null || candidate === null) return ip === range;
  if (rawBits === undefined) return address === candidate;
  const bits = Number(rawBits);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (address & mask) === (candidate & mask);
}

export function isAmritaNetworkRequest(req) {
  const ip = clientIp(req);
  return Boolean(ip) && configuredRanges().some((range) => matchesRange(ip, range));
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  return res.status(200).json({ isAmritaNetwork: isAmritaNetworkRequest(req) });
}
