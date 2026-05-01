/**
 * Redacts the last 4 digits of a phone number for safe logging.
 * e.g. "+9779812345678" → "+977981234****"
 */
export declare function redactPhone(phone: string): string;
/**
 * Sends a single SMS via Sparrow SMS gateway.
 * Throws if the HTTP request fails or Sparrow returns a non-success response code.
 * Callers must catch and swallow this error when SMS failure must not block the response.
 */
export declare function sendSms(to: string, text: string): Promise<void>;
//# sourceMappingURL=sparrow.d.ts.map