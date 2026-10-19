CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  table_number VARCHAR(50) NOT NULL,
  items JSONB NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  order_type VARCHAR(20) NOT NULL DEFAULT 'TABLE' CHECK (order_type IN ('TABLE', 'DELIVERY')),
  delivery_details JSONB,
  outlet_id VARCHAR(100),
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLATION_REQUESTED', 'REFUND_PENDING', 'REFUNDED')),
  cancellation_reason VARCHAR(500),
  cancellation_requested_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refund_id VARCHAR(100) UNIQUE,
  refund_status VARCHAR(30),
  paid_at TIMESTAMPTZ,
  ichef_dispatched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
