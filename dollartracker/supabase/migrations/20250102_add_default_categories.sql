-- Create function to insert default categories
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for the new user
  INSERT INTO categories (user_id, name, icon, is_system)
  VALUES
    (NEW.id, 'Food', 'food', TRUE),
    (NEW.id, 'Entertainment', 'movie', TRUE),
    (NEW.id, 'Shopping', 'cart', TRUE),
    (NEW.id, 'Transport', 'car', TRUE),
    (NEW.id, 'Other', 'dots-horizontal', TRUE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default categories for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();
