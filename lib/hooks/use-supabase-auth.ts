import { useAuth } from '../../context/auth';

export function useSupabaseAuth() {
  const auth = useAuth();
  if (!auth) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return auth;
}
