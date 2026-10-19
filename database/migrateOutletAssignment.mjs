import 'dotenv/config';
import { query } from '../backend/config/db.js';
import pool from '../backend/config/db.js';

try {
  await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS outlet_id VARCHAR(100)');
  await query('CREATE INDEX IF NOT EXISTS orders_outlet_id_idx ON orders (outlet_id)');
  console.log('Outlet assignment field is ready.');
} finally {
  await pool.end();
}
