import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

type DemoUser = {
  uid: string;
  email: string;
  displayName: string;
};

type AuthContextType = {
  user: DemoUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (displayName: string) => void;
};

const guestUser: DemoUser = {
  uid: "guest-user",
  email: "guest@cinema.local",
  displayName: "Guest",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateDisplayName: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<DemoUser | null>(null);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAdmin: false,
      loading: false,
      login: async (email) => {
        setUser({
          uid: "mock-user",
          email: email || guestUser.email,
          displayName: email ? email.split("@")[0] : guestUser.displayName,
        });
      },
      register: async (_email, _password, displayName) => {
        setUser({
          uid: "mock-user",
          email: _email || guestUser.email,
          displayName: displayName || guestUser.displayName,
        });
      },
      logout: async () => {
        setUser(null);
      },
      updateDisplayName: (displayName) => {
        setUser((currentUser) => ({
          ...(currentUser ?? guestUser),
          displayName,
        }));
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
