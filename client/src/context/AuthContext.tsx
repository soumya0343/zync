import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AUTH_CACHE_KEY = "zync_auth_user";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name?: string | null;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function firebaseUserToUser(u: User): UserInfo {
  return {
    id: u.uid,
    email: u.email ?? "",
    name: u.displayName ?? null,
  };
}

function readCachedUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(u: UserInfo | null) {
  if (u) {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(AUTH_CACHE_KEY);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize synchronously from localStorage — no loading delay for returning users
  const [user, setUser] = useState<UserInfo | null>(readCachedUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const userInfo = firebaseUser ? firebaseUserToUser(firebaseUser) : null;
      setUser(userInfo);
      writeCachedUser(userInfo);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
  }) => {
    const { email, password } = credentials;
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    const userInfo = firebaseUserToUser(u);
    setUser(userInfo);
    writeCachedUser(userInfo);
  };

  const register = async (userData: {
    email: string;
    password: string;
    name?: string | null;
  }) => {
    const { email, password, name } = userData;
    const { user: u } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (name?.trim()) {
      await updateProfile(u, { displayName: name.trim() });
    }
    const userInfo = firebaseUserToUser(u);
    setUser(userInfo);
    writeCachedUser(userInfo);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: u } = await signInWithPopup(auth, provider);
    const userInfo = firebaseUserToUser(u);
    setUser(userInfo);
    writeCachedUser(userInfo);
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    const { user: u } = await signInWithPopup(auth, provider);
    const userInfo = firebaseUserToUser(u);
    setUser(userInfo);
    writeCachedUser(userInfo);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    writeCachedUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
