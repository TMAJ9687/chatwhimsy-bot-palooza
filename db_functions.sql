
-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
END;
$$;

-- Function to get admin user details
CREATE OR REPLACE FUNCTION public.get_admin_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_details JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', id,
      'email', email,
      'display_name', display_name,
      'created_at', created_at,
      'last_login', last_login
    ) INTO admin_details
  FROM public.admin_users
  WHERE id = p_user_id;
  
  RETURN admin_details;
END;
$$;

-- Function to update admin last login
CREATE OR REPLACE FUNCTION public.update_admin_last_login(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_users
  SET last_login = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_id TEXT,
  p_target_type TEXT,
  p_reason TEXT,
  p_duration TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_action_id UUID;
  action_record JSONB;
BEGIN
  -- Insert the new action
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_id,
    target_type,
    reason,
    duration,
    timestamp
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_target_id,
    p_target_type,
    p_reason,
    p_duration,
    NOW()
  ) RETURNING id INTO new_action_id;
  
  -- Get the full record
  SELECT 
    jsonb_build_object(
      'id', id,
      'admin_id', admin_id,
      'action_type', action_type,
      'target_id', target_id,
      'target_type', target_type,
      'reason', reason,
      'duration', duration,
      'timestamp', timestamp
    ) INTO action_record
  FROM public.admin_actions
  WHERE id = new_action_id;
  
  RETURN action_record;
END;
$$;

-- Function to get all admin actions
CREATE OR REPLACE FUNCTION public.get_admin_actions()
RETURNS JSONB[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  actions JSONB[];
BEGIN
  SELECT array_agg(
    jsonb_build_object(
      'id', id,
      'admin_id', admin_id,
      'action_type', action_type,
      'target_id', target_id,
      'target_type', target_type,
      'reason', reason,
      'duration', duration,
      'timestamp', timestamp
    )
  ) INTO actions
  FROM public.admin_actions
  ORDER BY timestamp DESC;
  
  RETURN COALESCE(actions, '{}');
END;
$$;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_profiles INTEGER;
  vip_count INTEGER;
  ban_count INTEGER;
  result JSONB;
BEGIN
  -- Count total profiles
  SELECT COUNT(*) INTO total_profiles
  FROM public.profiles;
  
  -- Count VIP users
  SELECT COUNT(*) INTO vip_count
  FROM public.vip_subscriptions
  WHERE is_active = TRUE;
  
  -- Count bans
  SELECT COUNT(*) INTO ban_count
  FROM public.admin_actions
  WHERE action_type = 'ban';
  
  -- Build result
  result := jsonb_build_object(
    'total_users', total_profiles,
    'vip_users', vip_count,
    'active_bans', ban_count
  );
  
  RETURN result;
END;
$$;
