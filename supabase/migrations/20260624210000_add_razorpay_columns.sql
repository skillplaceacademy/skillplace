-- Add Razorpay columns to payments table (idempotent)
-- These columns are already defined in schema.sql for new installations.
-- Run this migration on existing databases that lack these columns.

DO $$ 
BEGIN
  -- Add razorpay_order_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'razorpay_order_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN razorpay_order_id TEXT;
  END IF;

  -- Add razorpay_payment_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'razorpay_payment_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN razorpay_payment_id TEXT;
  END IF;

  -- Add razorpay_signature if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'razorpay_signature'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN razorpay_signature TEXT;
  END IF;

  -- Add updated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;
