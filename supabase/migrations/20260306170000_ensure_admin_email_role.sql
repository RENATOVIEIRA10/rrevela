-- Guarantee admin role for Renato's account, including future signups with this email.

-- Backfill admin role for existing user with this email.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) = lower('renatovieiraaurelio@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure trigger function assigns admin role for this specific email on signup.
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF lower(COALESCE(NEW.email, '')) = lower('renatovieiraaurelio@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
