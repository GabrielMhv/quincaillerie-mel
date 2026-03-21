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
