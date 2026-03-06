-- Grant admin role to Renato by email (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) = lower('renatovieiraaurelio@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
