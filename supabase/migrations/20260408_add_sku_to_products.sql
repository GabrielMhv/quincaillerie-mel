-- Migration to add SKU column to products table
-- Created on 2026-04-08

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
