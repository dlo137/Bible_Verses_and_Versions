-- Add cleanup function for orphaned subscriptions

CREATE OR REPLACE FUNCTION delete_orphaned_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete subscription records where the user no longer exists
    DELETE FROM subscriptions 
    WHERE user_id NOT IN (
        SELECT id FROM auth.users
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;