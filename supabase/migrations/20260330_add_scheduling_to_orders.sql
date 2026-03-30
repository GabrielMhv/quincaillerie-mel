-- Migration: Add scheduling columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
