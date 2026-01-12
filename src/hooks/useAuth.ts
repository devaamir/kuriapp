import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser, clearUser, setAuthState } from '../store';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.app);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    if (response.success) {
      dispatch(setUser(response.user));
    }
    return response;
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    const response = await authService.register(userData);
    if (response.success) {
      dispatch(setUser(response.user));
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    dispatch(clearUser());
  };

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        const user = await authService.getMe();
        if (user) {
          dispatch(setUser(user));
          return true;
        }
      }
      dispatch(setAuthState(false));
      return false;
    } catch (error) {
      dispatch(setAuthState(false));
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };
};
