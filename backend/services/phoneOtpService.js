import crypto from 'node:crypto';
import { isMsg91Configured, msg91Settings } from '../config/phoneOtp.js';

const attempts = new Map();
const verifiedTokens = new Map();
const SEND_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 20 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 3;

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const normalizeIndianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) {
    throw createError('Enter a valid Indian 10-digit mobile number.', 422);
  }
  return `91${local}`;
};

const prune = () => {
  const now = Date.now();
  for (const [key, timestamps] of attempts) {
    const recent = timestamps.filter((timestamp) => now - timestamp < SEND_WINDOW_MS);
    if (recent.length) attempts.set(key, recent);
    else attempts.delete(key);
  }
  for (const [token, record] of verifiedTokens) {
    if (record.expiresAt <= now) verifiedTokens.delete(token);
  }
};

const providerRequest = async (url, options) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(10000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.type === 'error') {
    throw createError('Unable to send the SMS code. Please try again shortly.', 502);
  }
  return body;
};

export const sendPhoneOtp = async ({ phone, clientId }) => {
  if (!isMsg91Configured()) {
    throw createError('SMS verification is not configured yet.', 503);
  }
  prune();
  const mobile = normalizeIndianPhone(phone);
  const rateKey = `${clientId}:${mobile}`;
  const recent = attempts.get(rateKey) || [];
  if (recent.length >= MAX_SENDS_PER_WINDOW) {
    throw createError('Too many code requests. Please wait 15 minutes and try again.', 429);
  }

  const { authKey, templateId } = msg91Settings();
  const url = new URL('https://control.msg91.com/api/v5/otp');
  url.searchParams.set('template_id', templateId);
  url.searchParams.set('mobile', mobile);
  await providerRequest(url, {
    method: 'POST',
    headers: { authkey: authKey, 'content-type': 'application/json' },
    body: '{}'
  });
  attempts.set(rateKey, [...recent, Date.now()]);
  return { mobile: `******${mobile.slice(-4)}` };
};

export const verifyPhoneOtp = async ({ phone, otp, clientId }) => {
  if (!isMsg91Configured()) {
    throw createError('SMS verification is not configured yet.', 503);
  }
  const mobile = normalizeIndianPhone(phone);
  if (!/^\d{4,9}$/.test(String(otp || ''))) {
    throw createError('Enter the OTP sent by SMS.', 422);
  }
  const { authKey } = msg91Settings();
  const url = new URL('https://control.msg91.com/api/v5/otp/verify');
  url.searchParams.set('otp', String(otp));
  url.searchParams.set('mobile', mobile);
  const result = await providerRequest(url, {
    method: 'GET',
    headers: { authkey: authKey }
  });
  if (result.type !== 'success' && !/verified/i.test(String(result.message || ''))) {
    throw createError('That SMS code is invalid or has expired.', 422);
  }
  prune();
  const token = crypto.randomUUID();
  verifiedTokens.set(token, { mobile, clientId, expiresAt: Date.now() + VERIFY_TOKEN_TTL_MS });
  return { verificationToken: token, expiresInSeconds: VERIFY_TOKEN_TTL_MS / 1000 };
};

export const consumePhoneVerification = ({ phone, verificationToken, clientId }) => {
  prune();
  const mobile = normalizeIndianPhone(phone);
  const record = verifiedTokens.get(verificationToken);
  if (!record || record.mobile !== mobile || record.clientId !== clientId || record.expiresAt <= Date.now()) {
    throw createError('Verify this phone number by SMS before placing the order.', 403);
  }
  verifiedTokens.delete(verificationToken);
};
