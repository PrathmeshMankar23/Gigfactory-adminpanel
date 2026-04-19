'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminsApi } from '../../lib/api';
import { Admin } from '../../lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedEmail = localStorage.getItem('adminEmail');
        
        if (storedEmail) {
          const adminsList = await adminsApi.list();
          // Find the admin matching the stored email safely
          const currentAdmin = Array.isArray(adminsList) ? adminsList.find((admin) => admin.email === storedEmail) : null;
          
          if (currentAdmin) {
            setProfile(currentAdmin);
          } else {
            // Fallback mock if completely disconnected or empty db but logged in as demo
            setProfile({ id: 'demo-session', name: 'Super Admin', email: storedEmail, role: 'SUPER_ADMIN' });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <AdminLayout>
      <div className="fade-in max-w-2xl mx-auto mt-10">
        <h1 className="header-title mb-6">My Profile</h1>
        
        <div className="bg-white p-8 rounded-lg shadow border border-gray-100">
          {loading ? (
            <div className="text-gray-500 animate-pulse flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading profile mapping...
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6 border-b border-gray-100 pb-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-sm">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {profile.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Registrated Email</label>
                  <p className="text-md text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">System Account ID</label>
                  <p className="text-md text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono">{profile.id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">No valid active session mapping found.</p>
                <p className="text-sm opacity-80">It appears you're not fully signed into an existing administrator identity.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
