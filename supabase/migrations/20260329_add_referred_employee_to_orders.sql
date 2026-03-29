-- Migration: Add referred_employee_name column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referred_employee_name TEXT;
