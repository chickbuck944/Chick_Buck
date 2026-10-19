import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import ichefRoutes from './routes/ichefRoutes.js';
import phoneOtpRoutes from './routes/phoneOtpRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
// Required when deploying behind a reverse proxy so rate-limit clients are
// identified by their actual IP address. Set it to 1 for a single proxy hop.
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.use(helmet({
  // A phone testing over the local Wi-Fi uses HTTP. Helmet's default upgrade
  // directive would turn its CSS/image requests into HTTPS and make them fail.
  // Keep the directive enabled on an actual HTTPS production deployment.
  contentSecurityPolicy: {
    directives: {
      // menu.html contains the menu data and rendering script inline. It is
      // authored locally and required until it is moved into a bundled file.
      scriptSrc: ["'self'", "'unsafe-inline'"],
      // The Contact page embeds each outlet's Google Map in an iframe.
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com', 'https://www.google.co.in'],
      ...(process.env.NODE_ENV === 'production'
        ? {}
        : { 'upgrade-insecure-requests': null })
    }
  }
}));
app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get('/health', (request, response) => response.json({ status: 'ok' }));
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/ichef', ichefRoutes);
app.use('/api/phone-otp', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), phoneOtpRoutes);
// Serve the customer-facing website from the same origin as the API during
// local development and simple deployments. This also avoids browser CORS
// issues when the menu calls /api/orders.
app.use(express.static(projectRoot, {
  etag: true,
  lastModified: true,
  setHeaders: (response, filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.html') {
      // Always fetch the latest order page after a deployment.
      response.setHeader('Cache-Control', 'no-cache');
      return;
    }
    if (['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff', '.woff2'].includes(extension)) {
      // Reuse static files instead of downloading them again on every visit.
      response.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    }
  }
}));
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => console.log(`Chick Buck ordering API listening on port ${port}`));
}

export default app;
