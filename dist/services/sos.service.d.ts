import { SosAlertDto } from '../domain/types.js';
/**
 * Creates an active SOS alert for the given user.
 *
 * Side effects (SMS + Kafka) are fire-and-forget — failures are logged but
 * must never block the HTTP response.
 */
export declare function createSos(params: {
    userId: string;
    tripId?: string;
    lat: number;
    lng: number;
    message?: string;
}): Promise<SosAlertDto>;
/**
 * Cancels the active SOS alert for the given user.
 * Throws NOT_FOUND if no active alert exists.
 */
export declare function cancelSos(userId: string): Promise<void>;
/**
 * Returns the active SOS alert for the given user.
 * Throws NOT_FOUND if no active alert exists.
 */
export declare function getActiveSos(userId: string): Promise<SosAlertDto>;
//# sourceMappingURL=sos.service.d.ts.map