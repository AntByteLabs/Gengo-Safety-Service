import axios from 'axios';
import { config } from '../config.js';

interface SparrowPayload {
  token: string;
  from: string;
  to: string;
  text: string;
}

interface SparrowResponse {
  response_code: number;
  message: string;
}

/**
 * Redacts the last 4 digits of a phone number for safe logging.
 * e.g. "+9779812345678" → "+977981234****"
 */
export function redactPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, -4) + '****';
}

/**
 * Sends a single SMS via Sparrow SMS gateway.
 * Throws if the HTTP request fails or Sparrow returns a non-success response code.
 * Callers must catch and swallow this error when SMS failure must not block the response.
 */
export async function sendSms(to: string, text: string): Promise<void> {
  const payload: SparrowPayload = {
    token: config.SPARROW_TOKEN,
    from: config.SPARROW_FROM,
    to,
    text,
  };

  const { data } = await axios.post<SparrowResponse>(
    `${config.SPARROW_BASE_URL}/sms/`,
    payload,
    { timeout: 10_000 },
  );

  // Sparrow uses 200 response_code for success
  if (data.response_code !== 200) {
    throw new Error(`Sparrow SMS delivery failed: ${data.message}`);
  }
}
