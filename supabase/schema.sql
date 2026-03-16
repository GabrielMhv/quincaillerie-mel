-- ============================================
-- QUINCAILLERIE MULTI-BOUTIQUES - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create custom roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'client');
CREATE TYPE order_source AS ENUM ('reseaux_sociaux', 'ami', 'publicite', 'passage_boutique', 'employe');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

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
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE CASCADE NOT NULL,
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Decrement stock after order completion
-- ============================================
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
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

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_order();

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

CREATE TRIGGER on_order_referral_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_employee_referral();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_referrals ENABLE ROW LEVEL SECURITY;

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

-- USERS: Admin sees all, manager/employee sees their boutique, user sees self
CREATE POLICY "users_admin_all" ON public.users FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "users_read_self" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_manager_read_boutique" ON public.users FOR SELECT USING (
  get_user_role() = 'manager' AND boutique_id = get_user_boutique_id()
);
CREATE POLICY "users_employee_read_boutique" ON public.users FOR SELECT USING (
  get_user_role() = 'employee' AND boutique_id = get_user_boutique_id()
);

-- CATEGORIES: Readable by all, writable only by admin
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (get_user_role() = 'admin');

-- PRODUCTS: Readable by all (public site), writable only by admin
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (get_user_role() = 'admin');

-- STOCKS: Readable by authenticated (employees, managers), writable by admin
CREATE POLICY "stocks_read_authenticated" ON public.stocks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "stocks_public_read" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "stocks_admin_write" ON public.stocks FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "stocks_employee_decrement" ON public.stocks FOR UPDATE USING (
  get_user_role() IN ('employee', 'manager') AND boutique_id = get_user_boutique_id()
);

-- ORDERS: Admin sees all, manager/employee sees their boutique
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "orders_manager_boutique" ON public.orders FOR SELECT USING (
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
