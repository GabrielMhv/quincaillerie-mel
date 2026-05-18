-- ============================================
-- QUINCAILLERIE MULTI-BOUTIQUES - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Clean up existing objects (optional, use with caution)
DROP TABLE IF EXISTS public.employee_referrals CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.stocks CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.boutiques CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_source CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Create custom roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'client');
CREATE TYPE order_source AS ENUM ('reseaux_sociaux', 'ami', 'publicite', 'passage_boutique', 'employe');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE transfer_status AS ENUM ('pending', 'accepted', 'rejected', 'shipped', 'completed', 'cancelled');

-- ============================================
-- TABLE: boutiques
-- ============================================
CREATE TABLE public.boutiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: users (extends auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'client',
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  min_stock_alert INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: stocks
-- ============================================
CREATE TABLE public.stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, boutique_id)
);

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  source order_source NOT NULL,
  referred_employee_name TEXT,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  employee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  handler_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE NOT NULL,
  is_scheduled BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: order_items
-- ============================================
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL
);

-- ============================================
-- TABLE: site_settings
-- ============================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: employee_referrals
-- ============================================
CREATE TABLE public.employee_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'new_order', 'low_stock', 'transfer_request', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: stock_transfers
-- ============================================
CREATE TABLE public.stock_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE NOT NULL,
  to_boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE NOT NULL,
  status transfer_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  handled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: stock_transfer_items
-- ============================================
CREATE TABLE public.stock_transfer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID REFERENCES public.stock_transfers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- ============================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Handle stock decrementation
-- We need to handle two cases:
-- 1. Order inserted as 'completed' (like in POS) -> Trigger on order_items
-- 2. Order status updated to 'completed'        -> Trigger on orders
-- ============================================

-- Case 1: Deduct stock when item is added to an already completed order
CREATE OR REPLACE FUNCTION public.handle_stock_on_order_item_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_status order_status;
  v_boutique_id UUID;
BEGIN
  SELECT status, boutique_id INTO v_status, v_boutique_id 
  FROM public.orders WHERE id = NEW.order_id;
  
  IF v_status = 'completed' THEN
    UPDATE public.stocks 
    SET quantity = quantity - NEW.quantity
    WHERE product_id = NEW.product_id AND boutique_id = v_boutique_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_item_inserted ON public.order_items;
CREATE TRIGGER on_order_item_inserted
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_on_order_item_insert();

-- Case 2: Deduct stock for all items when status changes to 'completed'
CREATE OR REPLACE FUNCTION public.handle_stock_on_order_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.stocks s
    SET quantity = s.quantity - oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND s.product_id = oi.product_id
      AND s.boutique_id = NEW.boutique_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_on_order_update();

-- ============================================
-- TRIGGER: Create referral record when order has an employee referral
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_employee_referral()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
BEGIN
  IF NEW.source = 'employe' AND NEW.referred_employee_name IS NOT NULL THEN
    SELECT id INTO v_employee_id
    FROM public.users
    WHERE name ILIKE NEW.referred_employee_name AND role = 'employee'
    LIMIT 1;

    IF v_employee_id IS NOT NULL THEN
      INSERT INTO public.employee_referrals (employee_id, client_name, order_id)
      VALUES (v_employee_id, NEW.client_name, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_referral_created ON public.orders;
CREATE TRIGGER on_order_referral_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_employee_referral();

-- ============================================
-- TRIGGER: Create notification on new order
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_boutique_name TEXT;
BEGIN
  SELECT name INTO v_boutique_name FROM public.boutiques WHERE id = NEW.boutique_id;
  
  INSERT INTO public.notifications (type, title, message, boutique_id, metadata)
  VALUES (
    'new_order',
    'Nouvelle Commande',
    'Une commande de ' || NEW.total || ' CFA a Ã©tÃ© passÃ©e par ' || NEW.client_name || ' (' || v_boutique_name || ').',
    NEW.boutique_id,
    jsonb_build_object('order_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created_notification ON public.orders;
CREATE TRIGGER on_order_created_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_order_notification();

-- ============================================
-- TRIGGER: Create notification on low stock
-- ============================================
CREATE OR REPLACE FUNCTION public.check_low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_min_alert INTEGER;
  v_product_name TEXT;
  v_boutique_name TEXT;
BEGIN
  SELECT min_stock_alert, name INTO v_min_alert, v_product_name FROM public.products WHERE id = NEW.product_id;
  SELECT name INTO v_boutique_name FROM public.boutiques WHERE id = NEW.boutique_id;
  
  IF NEW.quantity <= v_min_alert THEN
    INSERT INTO public.notifications (type, title, message, boutique_id, metadata)
    VALUES (
      'low_stock',
      'Stock Bas !',
      'Le produit ' || v_product_name || ' est presque Ã©puisÃ© Ã  ' || v_boutique_name || ' (' || NEW.quantity || ' restants).',
      NEW.boutique_id,
      jsonb_build_object('product_id', NEW.product_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_updated_notification ON public.stocks;
CREATE TRIGGER on_stock_updated_notification
  AFTER UPDATE ON public.stocks
  FOR EACH ROW
  WHEN (NEW.quantity < OLD.quantity)
  EXECUTE FUNCTION public.check_low_stock_notification();

-- ============================================
-- TRIGGER: Handle stock movement on transfer completion
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_stock_transfer_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_stock_quantity INTEGER;
  v_item RECORD;
BEGIN
  -- 1. Deduct from sender when SHIPPED
  IF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
    FOR v_item IN (SELECT product_id, quantity FROM public.stock_transfer_items WHERE transfer_id = NEW.id) LOOP
      -- Check stock in source boutique
      SELECT quantity INTO v_stock_quantity 
      FROM public.stocks 
      WHERE product_id = v_item.product_id AND boutique_id = NEW.from_boutique_id;

      IF v_stock_quantity IS NULL OR v_stock_quantity < v_item.quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour le produit % dans la boutique source.', v_item.product_id;
      END IF;

      UPDATE public.stocks 
      SET quantity = quantity - v_item.quantity
      WHERE product_id = v_item.product_id AND boutique_id = NEW.from_boutique_id;
    END LOOP;
  END IF;

  -- 2. Add to receiver when COMPLETED (Received)
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.stocks (product_id, boutique_id, quantity)
    SELECT ti.product_id, NEW.to_boutique_id, ti.quantity
    FROM public.stock_transfer_items ti
    WHERE ti.transfer_id = NEW.id
    ON CONFLICT (product_id, boutique_id) 
    DO UPDATE SET quantity = public.stocks.quantity + EXCLUDED.quantity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transfer_completed ON public.stock_transfers;
CREATE TRIGGER on_transfer_completed
  AFTER UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_transfer_completion();

-- ============================================
-- TRIGGER: Notify target boutique on new transfer request
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_transfer_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_from_name TEXT;
  v_count INTEGER;
BEGIN
  SELECT name INTO v_from_name FROM public.boutiques WHERE id = NEW.from_boutique_id;
  
  -- Wait, items might not be inserted yet if it's a multi-item insert.
  -- But we are on AFTER INSERT of transfer.
  -- Better just say a new request was made.
  
  INSERT INTO public.notifications (type, title, message, boutique_id, metadata)
  VALUES (
    'transfer_request',
    'Demande de Transfert',
    'La boutique ' || v_from_name || ' vous demande du stock.',
    NEW.to_boutique_id, -- Wait, target should be the SOURCE boutique (from_boutique_id)!
    jsonb_build_object('transfer_id', NEW.id)
  );
  -- Corrected target: NEW.from_boutique_id is who provides stock.
  -- Wait, the receiver of notification should be the PROVIDER.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Let's fix the notification target in the replace call.
CREATE OR REPLACE FUNCTION public.handle_transfer_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
BEGIN
  SELECT name INTO v_requester_name FROM public.boutiques WHERE id = NEW.to_boutique_id;
  
  INSERT INTO public.notifications (type, title, message, boutique_id, metadata)
  VALUES (
    'transfer_request',
    'RequÃªte de Stock Entrante',
    'La boutique ' || v_requester_name || ' souhaite du stock de votre part.',
    NEW.from_boutique_id, -- The PROVIDER gets the notification
    jsonb_build_object('transfer_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transfer_requested_notification ON public.stock_transfers;
CREATE TRIGGER on_transfer_requested_notification
  AFTER INSERT ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.handle_transfer_request_notification();

-- ============================================
-- ROW LEVEL SECURITY (RLS) FOR STOCK TRANSFERS
-- ============================================
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

-- STOCK_TRANSFERS: Read access for involved boutiques or admins
DROP POLICY IF EXISTS "transfers_admin_all" ON public.stock_transfers;
CREATE POLICY "transfers_admin_all" ON public.stock_transfers FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "transfers_involved_boutique" ON public.stock_transfers;
CREATE POLICY "transfers_involved_boutique" ON public.stock_transfers FOR SELECT USING (
  from_boutique_id = get_user_boutique_id() OR to_boutique_id = get_user_boutique_id()
);

-- STOCK_TRANSFER_ITEMS: Access if parent transfer is readable
DROP POLICY IF EXISTS "items_admin_all" ON public.stock_transfer_items;
CREATE POLICY "items_admin_all" ON public.stock_transfer_items FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "items_read_involved" ON public.stock_transfer_items;
CREATE POLICY "items_read_involved" ON public.stock_transfer_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stock_transfers t
    WHERE t.id = transfer_id
      AND (t.from_boutique_id = get_user_boutique_id() OR t.to_boutique_id = get_user_boutique_id())
  )
);

DROP POLICY IF EXISTS "items_insert_involved" ON public.stock_transfer_items;
CREATE POLICY "items_insert_involved" ON public.stock_transfer_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stock_transfers t
      WHERE t.id = transfer_id
        AND t.to_boutique_id = get_user_boutique_id()
    )
  );

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's boutique
CREATE OR REPLACE FUNCTION public.get_user_boutique_id()
RETURNS UUID AS $$
  SELECT boutique_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- BOUTIQUES: Readable by all, writable only by admin
CREATE POLICY "boutiques_read_all" ON public.boutiques FOR SELECT USING (true);
CREATE POLICY "boutiques_admin_write" ON public.boutiques FOR ALL USING (get_user_role() = 'admin');

-- USERS policies
CREATE POLICY "users_read_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_admin_update" ON public.users FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "users_delete_self" ON public.users FOR DELETE USING (id = auth.uid()); -- Restricted to self per user request

-- CATEGORIES: Readable by all, writable only by admin
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (get_user_role() = 'admin');

-- PRODUCTS: Readable by all (public site), writable by admin and managers
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_write_access" ON public.products FOR ALL USING (get_user_role() IN ('admin', 'manager'));

-- STOCKS: Readable by authenticated (employees, managers), writable by admin and manager (for their boutique)
CREATE POLICY "stocks_read_authenticated" ON public.stocks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "stocks_public_read" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "stocks_admin_write" ON public.stocks FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "stocks_manager_write" ON public.stocks FOR ALL USING (
  get_user_role() = 'manager' AND boutique_id = get_user_boutique_id()
);
CREATE POLICY "stocks_employee_decrement" ON public.stocks FOR UPDATE USING (
  get_user_role() = 'employee' AND boutique_id = get_user_boutique_id()
);

-- ORDERS: Admin sees all, manager/employee sees their boutique
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "orders_manager_boutique" ON public.orders FOR ALL USING (
  get_user_role() = 'manager' AND boutique_id = get_user_boutique_id()
);
CREATE POLICY "orders_employee_boutique" ON public.orders FOR ALL USING (
  get_user_role() = 'employee' AND boutique_id = get_user_boutique_id()
);
CREATE POLICY "orders_public_insert" ON public.orders FOR INSERT WITH CHECK (true);

-- ORDER_ITEMS: Same as orders
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "order_items_read_by_order" ON public.order_items FOR SELECT USING (
  get_user_role() IN ('manager', 'employee')
);
CREATE POLICY "order_items_public_insert" ON public.order_items FOR INSERT WITH CHECK (true);

-- EMPLOYEE_REFERRALS: Admin sees all, manager sees boutique's
CREATE POLICY "referrals_admin_all" ON public.employee_referrals FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "referrals_manager_read" ON public.employee_referrals FOR SELECT USING (
  get_user_role() = 'manager'
);
CREATE POLICY "referrals_employee_read_self" ON public.employee_referrals FOR SELECT USING (
  employee_id = auth.uid()
);

-- NOTIFICATIONS: System table, readable by everyone but specific logic for display
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_authenticated_read" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "notifications_manager_update" ON public.notifications FOR UPDATE USING (get_user_role() = 'manager');

-- SITE_SETTINGS: Readable by all, writable only by admin
CREATE POLICY "site_settings_read_all" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all" ON public.site_settings FOR ALL USING (get_user_role() = 'admin');

-- STOCK_TRANSFERS: Accessible by admin and involved boutiques
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transfers_admin_all" ON public.stock_transfers FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "transfers_involved_boutique" ON public.stock_transfers FOR SELECT USING (
  from_boutique_id = get_user_boutique_id() OR to_boutique_id = get_user_boutique_id()
);
CREATE POLICY "transfers_create_outgoing" ON public.stock_transfers FOR INSERT WITH CHECK (
  get_user_role() IN ('manager', 'employee') AND to_boutique_id = get_user_boutique_id()
  -- Wait, user said: "lancer une requette aux autres boutiques pour leur permettre de demander du stock"
  -- So Boutique A (receiver) asks Boutique B (sender).
);
-- If Boutique A asks for stock, from_boutique_id is Sender (B), to_boutique_id is Receiver (A).
CREATE POLICY "transfers_handle_incoming" ON public.stock_transfers FOR UPDATE USING (
  get_user_role() = 'manager' AND from_boutique_id = get_user_boutique_id()
);

-- ============================================
-- SEED DATA: Default boutiques
-- ============================================
INSERT INTO public.boutiques (name, address) VALUES
  ('Boutique A', 'Adresse Boutique A'),
  ('Boutique B', 'Adresse Boutique B');

-- ============================================
-- SEED DATA: Sample categories
-- ============================================
INSERT INTO public.categories (name) VALUES
  ('Outils'),
  ('Quincaillerie'),
  ('Ã‰lectricitÃ©'),
  ('Plomberie'),
  ('Peinture'),
  ('Visserie & Boulonnerie');

-- ============================================
-- SEED DATA: Default site settings
-- ============================================
INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"name": "Quincaillerie Pro", "description": "Votre partenaire pour tous vos travaux.", "email": "contact@quincailleriepro.com", "phone": "+229 00 00 00 00", "address": "Cotonou, BÃ©nin"}'::jsonb);

-- MOVED FROM: 20260319_create_messages_table.sql

/*
  SQL to create the messages table
  Run this in your Supabase SQL Editor
*/

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Grant permissions for public submission
GRANT INSERT ON public.messages TO anon;
GRANT SELECT ON public.messages TO authenticated;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
DROP POLICY IF EXISTS "Anyone can submit a message" ON public.messages;
CREATE POLICY "Anyone can submit a message" 
ON public.messages FOR INSERT 
WITH CHECK (true);

-- Allow only admins to view/manage
DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" 
ON public.messages FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- MOVED FROM: 20260319_fix_orders_rls.sql

/*
  FIX ORDERS RLS
  Run this in your Supabase SQL Editor
*/

-- 1. Ensure RLS is enabled on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to anon (clients)
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;

-- 3. ORDERS Policies
DROP POLICY IF EXISTS "Public can place orders" ON public.orders;
CREATE POLICY "Public can place orders" 
ON public.orders FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- 4. ORDER ITEMS Policies
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" 
ON public.order_items FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items" 
ON public.order_items FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- MOVED FROM: 20260328_add_location_to_orders.sql

-- Migration: Add location coordinates to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- MOVED FROM: 20260329_add_referred_employee_to_orders.sql

-- Migration: Add referred_employee_name column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referred_employee_name TEXT;

-- MOVED FROM: 20260330_add_scheduling_to_orders.sql

-- Migration: Add scheduling columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- MOVED FROM: 20260407_security_performance_updates.sql

-- 1. Ajout d'index pour optimiser les performances de requÃªtes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_boutique_id ON orders (boutique_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product_id ON stocks (product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_boutique_id ON stocks (boutique_id);

-- 2. Audit des stocks : CrÃ©er une table pour suivre tous les changements
CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  quantity_changed INT NOT NULL,
  new_quantity INT NOT NULL,
  reason TEXT, -- 'Vente', 'Inventaire', 'Ajustement', 'Transfert'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger pour log automatique des changements de stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF OLD.quantity <> NEW.quantity THEN
      INSERT INTO stock_logs (product_id, boutique_id, quantity_changed, new_quantity, reason)
      VALUES (NEW.product_id, NEW.boutique_id, NEW.quantity - OLD.quantity, NEW.quantity, 'Ajustement automatique');
    END IF;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO stock_logs (product_id, boutique_id, quantity_changed, new_quantity, reason)
    VALUES (NEW.product_id, NEW.boutique_id, NEW.quantity, NEW.quantity, 'Stock initial/Nouveau');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_stock_change ON stocks;
CREATE TRIGGER tr_log_stock_change
AFTER INSERT OR UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION log_stock_change();

-- 4. Restauration de stock sur annulation de commande
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe Ã  'cancelled'
  IF (NEW.status = 'cancelled' AND OLD.status <> 'cancelled') THEN
    -- On remet le stock pour chaque item de la commande
    UPDATE stocks s
    SET quantity = s.quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND s.product_id = oi.product_id
      AND s.boutique_id = oi.boutique_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_restore_stock_on_cancel ON orders;
CREATE TRIGGER tr_restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancel();

-- MOVED FROM: 20260408_add_sku_to_products.sql

-- Migration to add SKU column to products table
-- Created on 2026-04-08

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- MOVED FROM: 20260409_create_storage_buckets.sql

-- Migration pour crÃ©er les buckets de stockage pour les avatars et le branding
-- Ã€ exÃ©cuter dans l'Ã©diteur SQL de Supabase

-- 1. CrÃ©ation des buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sÃ©curitÃ© (RLS) pour les avatars
-- Autoriser la lecture publique
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Autoriser l'upload aux utilisateurs authentifiÃ©s
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- Autoriser la modification/suppression de ses propres fichiers
CREATE POLICY "Owner Update and Delete" ON storage.objects FOR ALL USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politiques de sÃ©curitÃ© (RLS) pour le branding (Logo)
-- Autoriser la lecture publique
CREATE POLICY "Public Branding Access" ON storage.objects FOR SELECT USING (bucket_id = 'branding');

-- Autoriser l'upload et la gestion uniquement aux administrateurs
CREATE POLICY "Admin Branding Management" ON storage.objects FOR ALL USING (
  bucket_id = 'branding' AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- MOVED FROM: 20260409_fix_users_table.sql

-- Migration pour corriger la table public.users et synchroniser avec le code application
-- Ã€ exÃ©cuter dans l'Ã©diteur SQL de Supabase

-- 1. Ajout des colonnes manquantes Ã  la table public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Activer RLS pour la table public.users si ce n'est pas dÃ©jÃ  fait
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. S'assurer que les politiques de sÃ©curitÃ© sont correctes
DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self" ON public.users 
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_read_all" ON public.users;
CREATE POLICY "users_read_all" ON public.users 
FOR SELECT USING (true); -- Tout le monde peut voir les profils (basique)

-- MOVED FROM: 20260410_security_performance_final.sql

-- ============================================
-- PHASE 4: SECURITY & PERFORMANCE OPTIMIZATION
-- ============================================

-- 1. INDEXATION DES COLONNES DE RECHERCHE & FILTRAGE
CREATE INDEX IF NOT EXISTS idx_orders_boutique_id ON public.orders(boutique_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_product_id ON public.stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_boutique_id ON public.stocks(boutique_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_boutique ON public.notifications(boutique_id);

-- 2. ACTIVATION DE RLS SUR TOUTES LES TABLES
ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES RLS: USERS (PROFIL)
-- Tout le monde peut voir les profils de base, mais seul l'utilisateur peut modifier le sien
CREATE POLICY "Users are viewable by authenticated users" 
ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. POLITIQUES RLS: NOTIFICATIONS
-- Les utilisateurs ne voient que les notifications de leur boutique ou les notifications globales (Admin)
CREATE POLICY "Users can view relevant notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR 
  boutique_id = (SELECT boutique_id FROM public.users WHERE id = auth.uid())
);

-- 5. POLITIQUES RLS: ORDERS (SÃ‰CURITÃ‰ PAR BOUTIQUE)
-- Un employÃ© ne voit que les commandes de sa boutique. Un Admin voit tout.
CREATE POLICY "View orders by boutique access" 
ON public.orders FOR SELECT TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR 
  boutique_id = (SELECT boutique_id FROM public.users WHERE id = auth.uid())
);

-- 6. POLITIQUES RLS: PRODUCTS & STOCKS
-- Lecture publique pour tous les authentifiÃ©s, modification rÃ©servÃ©e aux managers/admins
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view stocks" ON public.stocks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/Manager can manage products" 
ON public.products FOR ALL TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'manager')
);

CREATE POLICY "Admin/Manager can manage stocks" 
ON public.stocks FOR ALL TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'manager')
);

-- MOVED FROM: 20260515_final_cleanup.sql

-- ============================================
-- ðŸ§¹ SCRIPT DE NETTOYAGE FINAL (PRE-PRODUCTION)
-- ============================================

-- 1. Supprimer toutes les commandes de test (et leurs items par CASCADE)
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;

-- 2. Supprimer les notifications de test
TRUNCATE TABLE public.notifications RESTART IDENTITY CASCADE;

-- 3. Supprimer l'historique des transferts
TRUNCATE TABLE public.stock_transfers RESTART IDENTITY CASCADE;

-- 4. Supprimer les messages
TRUNCATE TABLE public.messages RESTART IDENTITY CASCADE;


-- MOVED FROM: 20260515_phase1_indexes.sql

-- Phase 1: Database Performance Optimization
-- Add missing indexes for faster queries
-- Created: May 15, 2026

-- Index for orders filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders(status);

-- Index for orders filtering by boutique
CREATE INDEX IF NOT EXISTS idx_orders_boutique_id 
  ON public.orders(boutique_id);

-- Index for orders sorted by creation date
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at DESC);

-- Index for orders filtering by source
CREATE INDEX IF NOT EXISTS idx_orders_source 
  ON public.orders(source);

-- Index for stocks filtering by quantity
CREATE INDEX IF NOT EXISTS idx_stocks_quantity 
  ON public.stocks(quantity);

-- Index for stocks filtering by boutique
CREATE INDEX IF NOT EXISTS idx_stocks_boutique_id 
  ON public.stocks(boutique_id);

-- Index for order items by product
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items(product_id);

-- Index for order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items(order_id);

-- Index for products by category
CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON public.products(category_id);

-- Index for users by role
CREATE INDEX IF NOT EXISTS idx_users_role 
  ON public.users(role);

-- Index for users by boutique
CREATE INDEX IF NOT EXISTS idx_users_boutique_id 
  ON public.users(boutique_id);

-- Index for notifications by boutique
CREATE INDEX IF NOT EXISTS idx_notifications_boutique_id 
  ON public.notifications(boutique_id);

-- Index for notifications by read status
CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON public.notifications(is_read);

-- Composite index for common order queries
CREATE INDEX IF NOT EXISTS idx_orders_boutique_status 
  ON public.orders(boutique_id, status);

-- Composite index for common stock queries
CREATE INDEX IF NOT EXISTS idx_stocks_boutique_product 
  ON public.stocks(boutique_id, product_id);

-- Composite index for common user queries
CREATE INDEX IF NOT EXISTS idx_users_boutique_role 
  ON public.users(boutique_id, role);

-- Verify indexes created
-- Run this query to check:
-- SELECT * FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_%'
-- ORDER BY indexname;

-- MOVED FROM: 20260515_stock_transfer_triggers.sql

-- Phase 1B: Stock Transfer Triggers
-- Automatically handle stock updates when transfers are completed
-- Created: May 15, 2026

-- Trigger function to handle stock transfer completion
CREATE OR REPLACE FUNCTION handle_stock_transfer_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when transfer status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Decrement stock from source boutique
    UPDATE stocks
    SET quantity = quantity - (
      SELECT COALESCE(SUM(quantity), 0)
      FROM stock_transfer_items
      WHERE transfer_id = NEW.id AND product_id = stocks.product_id
    )
    WHERE boutique_id = NEW.from_boutique_id
      AND product_id IN (
        SELECT product_id FROM stock_transfer_items WHERE transfer_id = NEW.id
      );

    -- Increment stock to destination boutique
    UPDATE stocks
    SET quantity = quantity + (
      SELECT COALESCE(SUM(quantity), 0)
      FROM stock_transfer_items
      WHERE transfer_id = NEW.id AND product_id = stocks.product_id
    )
    WHERE boutique_id = NEW.to_boutique_id
      AND product_id IN (
        SELECT product_id FROM stock_transfer_items WHERE transfer_id = NEW.id
      );

    -- Create notification for destination boutique manager
    INSERT INTO notifications (type, title, message, boutique_id)
    VALUES (
      'transfer_completed',
      'Transfert de stock complÃ©tÃ©',
      'Un transfert de stock a Ã©tÃ© complÃ©tÃ© pour votre boutique',
      NEW.to_boutique_id
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_stock_transfer_completion ON stock_transfers;

-- Create trigger on stock_transfers table
CREATE TRIGGER trigger_stock_transfer_completion
  AFTER UPDATE ON stock_transfers
  FOR EACH ROW
  EXECUTE FUNCTION handle_stock_transfer_completion();

-- Trigger function to prevent stock deletion if transfer is in progress
CREATE OR REPLACE FUNCTION prevent_stock_deletion_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are any pending transfers for this product/boutique
  IF EXISTS (
    SELECT 1 FROM stock_transfers st
    JOIN stock_transfer_items sti ON st.id = sti.transfer_id
    WHERE sti.product_id = OLD.product_id
      AND (st.from_boutique_id = OLD.boutique_id OR st.to_boutique_id = OLD.boutique_id)
      AND st.status NOT IN ('completed', 'rejected')
  ) THEN
    RAISE EXCEPTION 'Cannot delete stock: active transfer in progress';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS prevent_stock_deletion_on_transfer ON stocks;

-- Create trigger to prevent deletion during active transfers
CREATE TRIGGER prevent_stock_deletion_on_transfer
  BEFORE DELETE ON stocks
  FOR EACH ROW
  EXECUTE FUNCTION prevent_stock_deletion_on_transfer();

-- Create audit table for transfer history
CREATE TABLE IF NOT EXISTS stock_transfer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES stock_transfers(id),
  action TEXT NOT NULL, -- 'initiated', 'accepted', 'rejected', 'completed'
  performed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  metadata JSONB
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_stock_transfer_logs_transfer_id 
  ON stock_transfer_logs(transfer_id);

CREATE INDEX IF NOT EXISTS idx_stock_transfer_logs_created_at 
  ON stock_transfer_logs(created_at DESC);

-- Trigger function to log transfer actions
CREATE OR REPLACE FUNCTION log_stock_transfer_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stock_transfer_logs (
    transfer_id,
    action,
    performed_by,
    metadata
  ) VALUES (
    NEW.id,
    CASE 
      WHEN NEW.status = 'pending' THEN 'initiated'
      WHEN NEW.status = 'accepted' THEN 'accepted'
      WHEN NEW.status = 'rejected' THEN 'rejected'
      WHEN NEW.status = 'completed' THEN 'completed'
      ELSE 'unknown'
    END,
    COALESCE(NEW.created_by, auth.uid()),
    NEW.metadata
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_log_stock_transfer_action ON stock_transfers;

-- Create trigger to log all transfer actions
CREATE TRIGGER trigger_log_stock_transfer_action
  AFTER INSERT OR UPDATE ON stock_transfers
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_transfer_action();

-- MOVED FROM: 20260520_enable_rls_stock_logs.sql

-- ========================================================
-- 🔒 ACTIVATION RLS POUR STOCK_LOGS (SÉCURITÉ)
-- ========================================================

-- 1. Activer RLS
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;

-- 2. Politique : Les employés peuvent voir les logs de leur propre boutique
-- Les administrateurs peuvent tout voir
CREATE POLICY "Stock logs are viewable by assigned store employees"
ON public.stock_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND (
            users.role = 'admin' 
            OR users.boutique_id = stock_logs.boutique_id
        )
    )
);

-- 3. Politique : Seul le système (via triggers ou admins) peut insérer des logs
-- (Généralement les logs sont automatiques via triggers, mais nous prévoyons l'accès admin)
CREATE POLICY "Stock logs are insertable by system/admins"
ON public.stock_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Note: Pas de UPDATE ou DELETE sur les logs pour garantir l'intégrité de l'audit.

