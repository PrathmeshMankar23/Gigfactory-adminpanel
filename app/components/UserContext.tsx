'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Admin } from '../../lib/types';
import { adminsApi } from '../../lib/api';

interface UserContextType {
  user: Admin | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const email = localStorage.getItem('adminEmail');
      if (!email) {
        setUser(null);
        setLoading(false);
        return;
      }

      const admins = await adminsApi.list();
      const currentAdmin = admins.find(a => a.email === email);
      
      if (currentAdmin) {
        setUser(currentAdmin);
      } else {
        // Handle case where user logged in but doesn't exist in DB (shouldn't happen in real app)
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user context:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
