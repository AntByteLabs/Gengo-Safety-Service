"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCidrList = parseCidrList;
exports.isAddressInCidrList = isAddressInCidrList;
exports.verifyInternalAuthHmac = verifyInternalAuthHmac;
const crypto_1 = require("crypto");
function ipv4ToInt(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4)
        return null;
    let n = 0;
    for (const part of parts) {
        if (!/^\d+$/.test(part))
            return null;
        const v = Number(part);
        if (v < 0 || v > 255)
            return null;
        n = (n << 8) | v;
    }
    return n >>> 0;
}
function ipv6ToBigInt(ip) {
    // Strip zone id (e.g. fe80::1%eth0)
    const base = ip.split('%')[0] ?? ip;
    // Handle IPv4-mapped (::ffff:1.2.3.4)
    let working = base;
    const mapped = base.match(/^(.*:)((?:\d{1,3}\.){3}\d{1,3})$/);
    if (mapped) {
        const v4 = ipv4ToInt(mapped[2] ?? '');
        if (v4 == null)
            return null;
        const high = (v4 >>> 16) & 0xffff;
        const low = v4 & 0xffff;
        working = `${mapped[1]}${high.toString(16)}:${low.toString(16)}`;
    }
    const dbl = working.indexOf('::');
    let head;
    let tail;
    if (dbl === -1) {
        head = working.split(':');
        tail = [];
    }
    else {
        head = working.slice(0, dbl) === '' ? [] : working.slice(0, dbl).split(':');
        tail = working.slice(dbl + 2) === '' ? [] : working.slice(dbl + 2).split(':');
    }
    const missing = 8 - head.length - tail.length;
    if (missing < 0)
        return null;
    const all = [...head, ...Array(missing).fill('0'), ...tail];
    if (all.length !== 8)
        return null;
    let out = 0n;
    for (const piece of all) {
        if (!/^[0-9a-fA-F]{1,4}$/.test(piece))
            return null;
        out = (out << 16n) | BigInt(parseInt(piece, 16));
    }
    return out;
}
function parseCidr(spec) {
    const trimmed = spec.trim();
    if (!trimmed)
        return null;
    const slash = trimmed.indexOf('/');
    if (slash === -1)
        return null;
    const ip = trimmed.slice(0, slash);
    const bits = Number(trimmed.slice(slash + 1));
    if (!Number.isInteger(bits) || bits < 0)
        return null;
    if (ip.includes(':')) {
        const network = ipv6ToBigInt(ip);
        if (network == null || bits > 128)
            return null;
        const mask = bits === 0 ? 0n : ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - bits)) - 1n);
        return { family: 6, network: network & mask, mask };
    }
    const network = ipv4ToInt(ip);
    if (network == null || bits > 32)
        return null;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return { family: 4, network: (network & mask) >>> 0, mask };
}
function parseCidrList(csv) {
    return csv
        .split(',')
        .map((s) => parseCidr(s))
        .filter((c) => c !== null);
}
/** Strips an IPv4-mapped IPv6 prefix so node sockets show as IPv4. */
function normaliseAddress(addr) {
    if (addr.startsWith('::ffff:'))
        return addr.slice(7);
    return addr;
}
function isAddressInCidrList(addr, cidrs) {
    if (!addr || cidrs.length === 0)
        return false;
    const ip = normaliseAddress(addr);
    if (ip.includes(':')) {
        const v6 = ipv6ToBigInt(ip);
        if (v6 == null)
            return false;
        return cidrs.some((c) => c.family === 6 && (v6 & c.mask) === c.network);
    }
    const v4 = ipv4ToInt(ip);
    if (v4 == null)
        return false;
    return cidrs.some((c) => c.family === 4 && ((v4 & c.mask) >>> 0) === c.network);
}
// ─────────────────────────────────────────────────────────────────────────────
// HMAC verification for X-Internal-Auth
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Verifies that `provided` is hex(HMAC-SHA256(secret, userId)).
 * Constant-time comparison; rejects malformed input safely.
 */
function verifyInternalAuthHmac(secret, userId, provided) {
    if (typeof provided !== 'string' || provided.length === 0)
        return false;
    // HMAC-SHA256 is always 32 bytes / 64 hex chars; reject length mismatches up
    // front so timingSafeEqual doesn't see a Buffer-length error path.
    if (!/^[0-9a-f]{64}$/i.test(provided))
        return false;
    const expected = (0, crypto_1.createHmac)('sha256', secret).update(userId).digest();
    let providedBuf;
    try {
        providedBuf = Buffer.from(provided, 'hex');
    }
    catch {
        return false;
    }
    if (providedBuf.length !== expected.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(providedBuf, expected);
}
//# sourceMappingURL=internal-trust.js.map