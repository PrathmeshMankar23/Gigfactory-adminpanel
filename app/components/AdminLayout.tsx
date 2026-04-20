'use client';

import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUser } from './UserContext';
import AuthWrapper from './AuthWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <LayoutContent>{children}</LayoutContent>
    </AuthWrapper>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminEmail');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  // Map user data for the Header
  const headerUser = {
    name: user?.name || 'Admin User',
    role: user?.role === 'SUPER_ADMIN' ? 'Super Admin' : (user?.role || 'Admin'),
    initial: (user?.name?.charAt(0) || 'A').toUpperCase()
  };

  const handleNewAction = () => {
    // Handle new action logic here
    console.log('New action clicked...');
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header currentUser={headerUser} onLogout={handleLogout} />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
