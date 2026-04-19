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
    { id: 'our-expertise', label: 'Our Expertise', icon: '🛠️', href: '/our-expertise' },
    { id: 'youtube-videos', label: 'YouTube Videos', icon: '▶️', href: '/youtube-videos' },

    // ✅ Recruitment Dropdown
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: '🏢',
      children: [
        { id: 'agency', label: 'Agency', icon: '🏢', href: '/recruitment/agency' },
        { id: 'freelancer', label: 'Freelancer', icon: '🧑‍💻', href: '/recruitment/freelancer' },
      ],
    },


    { id: 'admins', label: 'Admins', icon: '👥', href: '/admins' },
    { id: 'gigexpert', label: 'GigExpert Feedback', icon: '🌟', href: '/gigexpert' },

  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'admins' && user?.role !== 'SUPER_ADMIN') {
      return false;
    }
    return true;
  });

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
                  className="nav-item"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.id ? null : item.id)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </div>


                {/* 🔹 Dropdown Items */}
                {openDropdown === item.id && (
                  <div style={{ paddingLeft: '20px' }}>
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        className={`nav-item ${pathname === child.href ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveItem(child.id);
                          window.location.href = child.href!;
                        }}

                      >
                        <span className="nav-icon">{child.icon}</span>
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
    </div>
  );
}