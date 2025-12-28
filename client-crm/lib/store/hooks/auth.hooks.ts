import { useAppDispatch, useAppSelector } from './redux.hooks';
import { signIn, signUp, logout, getProfile, clearError, inviteUser } from '../slices/auth-slice/auth-slice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const handleSignIn = (credentials: { email: string; password: string }) => {
    return dispatch(signIn(credentials));
  };

  const handleSignUp = (userData: {
    email: string;
    password?: string;
    name: string;
    phones?: Array<{ number: string; isPrimary?: boolean }>;
    role: string;
    canSignIn?: boolean;
    street?: string;
    apt?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    notes?: string;
  }) => {
    return dispatch(signUp(userData));
  };

  const handleLogout = () => {
    return dispatch(logout());
  };

  const handleGetProfile = () => {
    return dispatch(getProfile());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleInviteUser = (email: string, role: string) => {
    return dispatch(inviteUser({ email, role }));
  };

  return {
    ...auth,
    signIn: handleSignIn,
    signUp: handleSignUp,
    logout: handleLogout,
    getProfile: handleGetProfile,
    clearError: handleClearError,
    inviteUser: handleInviteUser,
  };
};
