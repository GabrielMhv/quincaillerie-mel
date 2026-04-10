-- Migration pour corriger la table public.users et synchroniser avec le code application
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajout des colonnes manquantes à la table public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Activer RLS pour la table public.users si ce n'est pas déjà fait
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. S'assurer que les politiques de sécurité sont correctes
DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self" ON public.users 
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_read_all" ON public.users;
CREATE POLICY "users_read_all" ON public.users 
FOR SELECT USING (true); -- Tout le monde peut voir les profils (basique)
