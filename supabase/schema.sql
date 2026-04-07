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
    'Une commande de ' || NEW.total || ' CFA a été passée par ' || NEW.client_name || ' (' || v_boutique_name || ').',
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
      'Le produit ' || v_product_name || ' est presque épuisé à ' || v_boutique_name || ' (' || NEW.quantity || ' restants).',
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
    'Requête de Stock Entrante',
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
  ('Électricité'),
  ('Plomberie'),
  ('Peinture'),
  ('Visserie & Boulonnerie');

-- ============================================
-- SEED DATA: Default site settings
-- ============================================
INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"name": "Quincaillerie Pro", "description": "Votre partenaire pour tous vos travaux.", "email": "contact@quincailleriepro.com", "phone": "+229 00 00 00 00", "address": "Cotonou, Bénin"}'::jsonb);
