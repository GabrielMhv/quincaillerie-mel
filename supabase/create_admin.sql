-- Script SQL pour créer un administrateur principal directement dans Supabase.
-- À exécuter dans le SQL Editor de votre projet Supabase.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  admin_email TEXT := 'mahuvigabiel@gmail.com';
  admin_pass TEXT := 'Gabi229!';
BEGIN
  -- 1. Vérifier si l'utilisateur existe déjà
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    
    -- 2. Insérer dans auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, last_sign_in_at, raw_app_meta_data, 
      raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_pass, gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Gabriel MAHUVI"}',
      now(),
      now()
    );

    -- 3. Attendre que le trigger handle_new_user crée la ligne dans public.users
    -- Puis mettre à jour le rôle de cet utilisateur
    UPDATE public.users
    SET role = 'admin'
    WHERE email = admin_email;
    
    RAISE NOTICE 'Utilisateur % créé avec succès.', admin_email;
  ELSE
    RAISE NOTICE 'L''utilisateur % existe déjà.', admin_email;
    
    -- S'il existe déjà, on s'assure quand même qu'il est admin
    UPDATE public.users SET role = 'admin' WHERE email = admin_email;
  END IF;
END $$;
