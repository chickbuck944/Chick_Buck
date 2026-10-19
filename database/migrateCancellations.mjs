import 'dotenv/config';
import { query } from '../backend/config/db.js';
import pool from '../backend/config/db.js';

try {
  await query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
  await query("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLATION_REQUESTED', 'REFUND_PENDING', 'REFUNDED'))");
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500)');
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ');
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ');
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_id VARCHAR(100) UNIQUE');
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(30)');
  console.log('Cancellation and refund fields are ready.');
} finally {
  await pool.end();
}
