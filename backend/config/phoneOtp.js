export const isPhoneOtpRequired = () => process.env.PHONE_OTP_REQUIRED === 'true';

export const isMsg91Configured = () => Boolean(
  process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID
);

export const msg91Settings = () => ({
  authKey: process.env.MSG91_AUTH_KEY,
  templateId: process.env.MSG91_OTP_TEMPLATE_ID
});
