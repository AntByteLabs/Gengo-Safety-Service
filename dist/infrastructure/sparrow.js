"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactPhone = redactPhone;
exports.sendSms = sendSms;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("../config.js");
/**
 * Redacts the last 4 digits of a phone number for safe logging.
 * e.g. "+9779812345678" → "+977981234****"
 */
function redactPhone(phone) {
    if (phone.length <= 4)
        return '****';
    return phone.slice(0, -4) + '****';
}
/**
 * Sends a single SMS via Sparrow SMS gateway.
 * Throws if the HTTP request fails or Sparrow returns a non-success response code.
 * Callers must catch and swallow this error when SMS failure must not block the response.
 */
async function sendSms(to, text) {
    const payload = {
        token: config_js_1.config.SPARROW_TOKEN,
        from: config_js_1.config.SPARROW_FROM,
        to,
        text,
    };
    const { data } = await axios_1.default.post(`${config_js_1.config.SPARROW_BASE_URL}/sms/`, payload, { timeout: 10_000 });
    // Sparrow uses 200 response_code for success
    if (data.response_code !== 200) {
        throw new Error(`Sparrow SMS delivery failed: ${data.message}`);
    }
}
//# sourceMappingURL=sparrow.js.map