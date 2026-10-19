import crypto from 'node:crypto';

export const requireAdminKey = (request, response, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  const suppliedKey = request.get('x-admin-api-key');
  if (!configuredKey || !suppliedKey || configuredKey.length !== suppliedKey.length || !crypto.timingSafeEqual(Buffer.from(configuredKey), Buffer.from(suppliedKey))) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};
