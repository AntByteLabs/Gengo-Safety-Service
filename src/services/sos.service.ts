import { ulid } from 'ulid';
import { AppError } from '../domain/errors.js';
import { SosAlertDto, SosAlertRow } from '../domain/types.js';
import {
  insertSosAlert,
  findActiveSosAlert,
  cancelActiveSosAlert,
} from '../repositories/sos.repository.js';
import { findActiveContactsByUserId } from '../repositories/contact.repository.js';
import { sendSms, redactPhone } from '../infrastructure/sparrow.js';
import { publishEvent } from '../infrastructure/kafka.js';
import { config } from '../config.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function rowToDto(row: SosAlertRow): SosAlertDto {
  return {
    sosId: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    status: row.status as 'active' | 'cancelled',
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
export async function createSos(params: {
  userId: string;
  tripId?: string;
  lat: number;
  lng: number;
  message?: string;
}): Promise<SosAlertDto> {
  // Enforce uniqueness: one active SOS per user at a time
  const existing = await findActiveSosAlert(params.userId);
  if (existing) {
    throw AppError.conflict('User already has an active SOS alert');
  }

  const id = `sos_${ulid()}`;

  const row = await insertSosAlert({
    id,
    userId: params.userId,
    tripId: params.tripId ?? null,
    lat: params.lat,
    lng: params.lng,
    message: params.message ?? null,
  });

  const dto = rowToDto(row);

  // ── Fire-and-forget side effects ──────────────────────────────────────────

  // 1. Send SMS to all active emergency contacts (failures must NOT throw)
  void dispatchEmergencySms(params.userId, dto).catch((err: unknown) => {
    console.error('[sos-service] Unexpected error in SMS dispatch', {
      message: err instanceof Error ? err.message : String(err),
    });
  });

  // 2. Publish Kafka event (failures must NOT throw)
  publishEvent(config.KAFKA_TOPIC_SAFETY_SOS, params.userId, {
    sosId: dto.sosId,
    userId: dto.userId,
    tripId: dto.tripId,
    status: dto.status,
    lat: dto.location.lat,
    lng: dto.location.lng,
  }).catch((err: unknown) => {
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
export async function cancelSos(userId: string): Promise<void> {
  const row = await cancelActiveSosAlert(userId);
  if (!row) {
    throw AppError.notFound('Active SOS alert');
  }
}

/**
 * Returns the active SOS alert for the given user.
 * Throws NOT_FOUND if no active alert exists.
 */
export async function getActiveSos(userId: string): Promise<SosAlertDto> {
  const row = await findActiveSosAlert(userId);
  if (!row) {
    throw AppError.notFound('Active SOS alert');
  }
  return rowToDto(row);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function dispatchEmergencySms(userId: string, sos: SosAlertDto): Promise<void> {
  const contacts = await findActiveContactsByUserId(userId);

  if (contacts.length === 0) {
    console.info('[sos-service] No emergency contacts found for user', { userId });
    return;
  }

  const tripPart = sos.tripId ?? 'N/A';
  const locationPart = `${sos.location.lat},${sos.location.lng}`;

  const results = await Promise.allSettled(
    contacts.map(async (contact) => {
      const text =
        `EMERGENCY: ${contact.name} triggered SOS. ` +
        `Trip: ${tripPart}. Location: ${locationPart}`;

      try {
        await sendSms(contact.phone, text);
        console.info('[sos-service] SMS sent', {
          to: redactPhone(contact.phone),
          sosId: sos.sosId,
        });
      } catch (err) {
        // Log + continue — a single contact SMS failure must not stop others
        console.error('[sos-service] SMS failed', {
          to: redactPhone(contact.phone),
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn('[sos-service] Some SMS dispatches rejected', { failed, total: contacts.length });
  }
}
