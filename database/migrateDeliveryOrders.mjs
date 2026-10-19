import 'dotenv/config';
import { query } from '../backend/config/db.js';
import pool from '../backend/config/db.js';

try {
  await query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'TABLE'
      CHECK (order_type IN ('TABLE', 'DELIVERY'))
  `);
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_details JSONB');
  console.log('Delivery order fields are ready.');
} finally {
  await pool.end();
}
