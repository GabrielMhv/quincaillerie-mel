-- Migration: Add location coordinates to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
