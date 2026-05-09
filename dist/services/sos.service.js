"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSos = createSos;
exports.cancelSos = cancelSos;
exports.getActiveSos = getActiveSos;
const ulid_1 = require("ulid");
const errors_js_1 = require("../domain/errors.js");
const sos_repository_js_1 = require("../repositories/sos.repository.js");
const contact_repository_js_1 = require("../repositories/contact.repository.js");
const sparrow_js_1 = require("../infrastructure/sparrow.js");
const kafka_js_1 = require("../infrastructure/kafka.js");
const config_js_1 = require("../config.js");
// ── Helpers ───────────────────────────────────────────────────────────────────
function rowToDto(row) {
    return {
        sosId: row.id,
        userId: row.user_id,
        tripId: row.trip_id,
        status: row.status,
        location: { lat: row.lat, lng: row.lng },
        message: row.message,
        createdAt: row.created_at.getTime(),
    };
}
// ── Service operations ────────────────────────────────────────────────────────
/**
 * Creates an active SOS alert for the given user.
 *
 * Side effects (SMS + Kafka) are fire-and-forget — failures are logged but
 * must never block the HTTP response.
 */
async function createSos(params) {
    const id = `sos_${(0, ulid_1.ulid)()}`;
    // Atomic uniqueness: rely on the partial unique index on
    // safety.sos_alerts(user_id) WHERE status='active' (migration 002).
    // Treat 23505 (unique_violation) as "user already has an active SOS"
    // and return the existing row — never block an emergency on a race.
    let row;
    try {
        row = await (0, sos_repository_js_1.insertSosAlert)({
            id,
            userId: params.userId,
            tripId: params.tripId ?? null,
            lat: params.lat,
            lng: params.lng,
            message: params.message ?? null,
        });
    }
    catch (err) {
        if (isPgUniqueViolation(err)) {
            const existing = await (0, sos_repository_js_1.findActiveSosAlert)(params.userId);
            if (existing) {
                // Idempotent: the second caller gets the *current* active alert
                // (same shape as the original create response). No fan-out side
                // effects re-fired.
                return rowToDto(existing);
            }
        }
        throw err;
    }
    const dto = rowToDto(row);
    // ── Fire-and-forget side effects ──────────────────────────────────────────
    // 1. Send SMS to all active emergency contacts (failures must NOT throw)
    void dispatchEmergencySms(params.userId, dto).catch((err) => {
        console.error('[sos-service] Unexpected error in SMS dispatch', {
            message: err instanceof Error ? err.message : String(err),
        });
    });
    // 2. Publish Kafka event (failures must NOT throw)
    (0, kafka_js_1.publishEvent)(config_js_1.config.KAFKA_TOPIC_SAFETY_SOS, params.userId, {
        sosId: dto.sosId,
        userId: dto.userId,
        tripId: dto.tripId,
        status: dto.status,
        lat: dto.location.lat,
        lng: dto.location.lng,
    }).catch((err) => {
        console.error('[sos-service] Kafka publish failed', {
            message: err instanceof Error ? err.message : String(err),
        });
    });
    return dto;
}
/**
 * Cancels the active SOS alert for the given user.
 * Throws NOT_FOUND if no active alert exists.
 */
async function cancelSos(userId) {
    const row = await (0, sos_repository_js_1.cancelActiveSosAlert)(userId);
    if (!row) {
        throw errors_js_1.AppError.notFound('Active SOS alert');
    }
}
/**
 * Returns the active SOS alert for the given user.
 * Throws NOT_FOUND if no active alert exists.
 */
async function getActiveSos(userId) {
    const row = await (0, sos_repository_js_1.findActiveSosAlert)(userId);
    if (!row) {
        throw errors_js_1.AppError.notFound('Active SOS alert');
    }
    return rowToDto(row);
}
// ── Internal helpers ──────────────────────────────────────────────────────────
/** Narrows an unknown thrown value to a Postgres unique-violation (23505). */
function isPgUniqueViolation(err) {
    return (typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === sos_repository_js_1.PG_UNIQUE_VIOLATION);
}
async function dispatchEmergencySms(userId, sos) {
    const contacts = await (0, contact_repository_js_1.findActiveContactsByUserId)(userId);
    if (contacts.length === 0) {
        console.info('[sos-service] No emergency contacts found for user', { userId });
        return;
    }
    const tripPart = sos.tripId ?? 'N/A';
    const locationPart = `${sos.location.lat},${sos.location.lng}`;
    const results = await Promise.allSettled(contacts.map(async (contact) => {
        const text = `EMERGENCY: ${contact.name} triggered SOS. ` +
            `Trip: ${tripPart}. Location: ${locationPart}`;
        try {
            await (0, sparrow_js_1.sendSms)(contact.phone, text);
            console.info('[sos-service] SMS sent', {
                to: (0, sparrow_js_1.redactPhone)(contact.phone),
                sosId: sos.sosId,
            });
        }
        catch (err) {
            // Log + continue — a single contact SMS failure must not stop others
            console.error('[sos-service] SMS failed', {
                to: (0, sparrow_js_1.redactPhone)(contact.phone),
                message: err instanceof Error ? err.message : String(err),
            });
        }
    }));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
        console.warn('[sos-service] Some SMS dispatches rejected', { failed, total: contacts.length });
    }
}
//# sourceMappingURL=sos.service.js.map