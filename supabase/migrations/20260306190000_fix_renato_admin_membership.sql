-- Definitively attach Renato account to admin role.
-- Keep this idempotent so it can be applied safely multiple times.

-- Remove plain user role for this account when present.
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
  AND lower(u.email) = lower('renatovieiraaurelio@gmail.com')
  AND ur.role = 'user'::public.app_role;

-- Ensure admin role exists for this account.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = lower('renatovieiraaurelio@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
