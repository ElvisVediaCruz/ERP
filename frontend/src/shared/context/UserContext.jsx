import { createContext, useContext, useState } from 'react';
import { getAuth, setAuth, clearAuth } from '../services/authStorage';
import { login as loginRequest } from '@modules/auth/services/auth.service';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => getAuth()?.user ?? null);

  const login = async (username, password) => {
    const auth = await loginRequest({ username, password });
    setAuth(auth);
    setUser(auth.user);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role_name);
  const isAdmin = () => hasRole('admin');

  return (
    <UserContext.Provider value={{ user, login, logout, hasRole, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
