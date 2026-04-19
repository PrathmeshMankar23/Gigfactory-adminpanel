'use client';

import { useRouter } from 'next/navigation';

interface User {
  name: string;
  role: string;
  initial: string;
}

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="header">
      <div className="header-title">Admin Panel</div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
       
        <div className="header-profile">
          <div className="profile-avatar">
            {currentUser.initial}
          </div>
          <div className="profile-info">
            <div className="profile-name">{currentUser.name}</div>
            <div className="profile-role">{currentUser.role}</div>
          </div>
        </div>

        
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => router.push('/profile')}
        >
          My Profile
        </button>

        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
