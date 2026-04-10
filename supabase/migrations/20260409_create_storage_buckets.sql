-- Migration pour créer les buckets de stockage pour les avatars et le branding
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Création des buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sécurité (RLS) pour les avatars
-- Autoriser la lecture publique
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Autoriser l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- Autoriser la modification/suppression de ses propres fichiers
CREATE POLICY "Owner Update and Delete" ON storage.objects FOR ALL USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politiques de sécurité (RLS) pour le branding (Logo)
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
