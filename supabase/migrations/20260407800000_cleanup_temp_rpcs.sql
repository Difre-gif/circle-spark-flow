-- Revert temporary debugging RPCs
DROP FUNCTION IF EXISTS public.get_invitations_policies();
DROP FUNCTION IF EXISTS public.get_recent_invitations();
DROP FUNCTION IF EXISTS public.test_org_query(uuid);
DROP FUNCTION IF EXISTS public.get_table_policies(text);
DROP FUNCTION IF EXISTS public.get_user_orgs(uuid);