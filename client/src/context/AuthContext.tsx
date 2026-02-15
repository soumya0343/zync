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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUserToUser(firebaseUser) : null);
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
    setUser(firebaseUserToUser(u));
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
    setUser(firebaseUserToUser(u));
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: u } = await signInWithPopup(auth, provider);
    setUser(firebaseUserToUser(u));
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    const { user: u } = await signInWithPopup(auth, provider);
    setUser(firebaseUserToUser(u));
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
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
