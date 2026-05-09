interface CidrV4 {
    family: 4;
    network: number;
    mask: number;
}
interface CidrV6 {
    family: 6;
    network: bigint;
    mask: bigint;
}
type Cidr = CidrV4 | CidrV6;
export declare function parseCidrList(csv: string): Cidr[];
export declare function isAddressInCidrList(addr: string | undefined, cidrs: Cidr[]): boolean;
/**
 * Verifies that `provided` is hex(HMAC-SHA256(secret, userId)).
 * Constant-time comparison; rejects malformed input safely.
 */
export declare function verifyInternalAuthHmac(secret: string, userId: string, provided: string): boolean;
export {};
//# sourceMappingURL=internal-trust.d.ts.map