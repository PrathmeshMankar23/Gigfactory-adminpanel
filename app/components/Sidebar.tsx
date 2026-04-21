import { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { usePathname } from 'next/navigation';


type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: MenuItem[];
};

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Auto-open dropdown based on current path
  useEffect(() => {
    if (pathname.startsWith('/recruitment/')) {
      setOpenDropdown('recruitment');
    }
  }, [pathname]);


  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: '🏗️', href: '/projects' },
    { id: 'case-studies', label: 'Case Studies', icon: '📋', href: '/case-studies' },

    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: '🤝',
      children: [
        { id: 'agency-rec', label: 'Agency', icon: '🏢', href: '/recruitment/agency' },
        { id: 'freelancer-rec', label: 'Freelancer', icon: '👤', href: '/recruitment/freelancer' },
      ]
    },
    { id: 'gigexpert', label: 'GigExpert Feedback', icon: '🌟', href: '/gigexpert' },

    { id: 'our-expertise', label: 'Our Expertise', icon: '🛠️', href: '/our-expertise' },
    { id: 'youtube-videos', label: 'YouTube Videos', icon: '▶️', href: '/youtube-videos' },
    { id: 'admins', label: 'Admins', icon: '👥', href: '/admins' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if ((item.id === 'admins' || item.id === 'enquiries') && user?.role !== 'SUPER_ADMIN') {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminEmail');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <a href="/dashboard" className="flex items-center justify-center w-full">
          <img
            src="/GIG.png"
            alt="Gigfactory Logo"
            className="sidebar-logo"
            style={{ maxWidth: '180px', height: 'auto', display: 'block' }}
          />
        </a>
      </div>


      <nav className="sidebar-nav">

        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            {/* 🔹 Normal Menu Item */}
            {!item.children ? (
              <a
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveItem(item.id);
                  window.location.href = item.href!;
                }}

              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <>
                {/* 🔹 Parent Dropdown */}
                <div
                  className={`nav-item ${openDropdown === item.id ? 'active' : ''}`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.id ? null : item.id)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  <span className="ml-auto text-[10px] opacity-50">{openDropdown === item.id ? '▼' : '▶'}</span>
                </div>


                {/* 🔹 Dropdown Items */}
                {openDropdown === item.id && (
                  <div className="bg-gray-50/50 rounded-xl mx-2 mb-2 overflow-hidden transition-all">
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        className={`nav-item text-sm py-2 ${pathname === child.href ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveItem(child.id);
                          window.location.href = child.href!;
                        }}
                        style={{ paddingLeft: '40px' }}
                      >
                        <span className="nav-icon text-xs">{child.icon}</span>
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto p-4 border-t border-zinc-100/10">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}