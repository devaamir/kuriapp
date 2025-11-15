import { useState, useEffect } from 'react';
// Mock functions for UI-only mode
const getProfile = async () => ({ 
  success: true, 
  data: { id: '1', name: 'Test User', email: 'test@example.com' } 
});
const updateProfile = async (data: any) => ({ 
  success: true, 
  data: { ...data, id: '1' } 
});

interface User {
  id: string;
  name: string;
  email: string;
}

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (name: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateProfile(name, email);
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Failed to update profile');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    user,
    loading,
    error,
    fetchProfile,
    updateUserProfile,
  };
};
