"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebase";
import { authService } from "@/services/authService";
import type { UserProfile } from "@/types/auth";

interface AuthState {
  firebaseUser: User | null;
  appUser: UserProfile | null;
  permissions: string[];
  roles: string[];
  isSuperAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  emailVerified: boolean;
  can: (permission: string) => boolean;
  isRole: (role: string) => boolean;
  /** Refresh profile from backend */
  refreshProfile: () => Promise<void>;
  /** Call after email verification to reload everything */
  onEmailVerified: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  firebaseUser: null,
  appUser: null,
  permissions: [],
  roles: [],
  isSuperAdmin: false,
  loading: true,
  profileLoading: false,
  emailVerified: false,
  can: () => false,
  isRole: () => false,
  refreshProfile: async () => {},
  onEmailVerified: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const permissions = appUser?.permissions ?? [];
  const roles = appUser?.roles ?? [];
  const isSuperAdmin = appUser?.isSuperAdmin ?? false;

  const can = useCallback(
    (permission: string) => isSuperAdmin || permissions.includes(permission),
    [permissions, isSuperAdmin]
  );

  const isRole = useCallback(
    (role: string) => roles.includes(role),
    [roles]
  );

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      await authService.sync();
      const profile = await authService.getMe();
      setAppUser(profile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setAppUser(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    await loadProfile();
  }, [firebaseUser, loadProfile]);

  /** Called after email verification — reloads user and syncs profile */
  const onEmailVerified = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    await user.reload();
    setFirebaseUser(user);
    setEmailVerified(user.emailVerified);
    if (user.emailVerified) {
      await loadProfile();
    }
  }, [loadProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setEmailVerified(user?.emailVerified ?? false);

      if (user && user.emailVerified) {
        await loadProfile();
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        permissions,
        roles,
        isSuperAdmin,
        loading,
        profileLoading,
        emailVerified,
        can,
        isRole,
        refreshProfile,
        onEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
