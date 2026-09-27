import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Bell, Building2, User, LogOut, Lock, LogIn } from 'lucide-react';
import './header.css';

interface Employee {
  name: string;
  role: string;
  id: string;
}

interface HeaderProps {
  isLoggedIn?: boolean;
  employee?: Employee | null;
  branches?: string[];
  loginPath?: string; // مسار صفحة تسجيل الدخول
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  employee = null,
  branches = ["الفرع الرئيسي"],
  loginPath = "/login",
  onSearch,
  onLogout,
  onLock
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLockClick = () => {
    setIsProfileOpen(false);
    if (onLock) onLock();
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <header className="bank-header">
      <div className="bank-header-container">
        
        {/* الشعار والحماية */}
        <div className="header-brand-section">
          <div className="brand-logo-container">
            <div className="brand-badge">RENDEPAY</div>
            <div className="brand-title-group">
              <span className="brand-title">Rendepay Core</span>
              <span className="brand-subtitle">بوابة الموظفين والعمليات</span>
            </div>
          </div>
          <div className="security-badge">
            <ShieldCheck size={15} color="#333333" />
            <span>جلسة آمنة (SSL)</span>
          </div>
        </div>

        {/* البحث */}
        <form className="header-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الحساب، الهوية، أو اسم العميل..." 
              className="search-input"
            />
            <button type="submit" className="search-button" aria-label="بحث">
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* أدوات الموظف والـ Auth */}
        <div className="header-actions">
          <div className="branch-select-box">
            <Building2 size={16} color="#333333" />
            <select className="branch-select" aria-label="اختر الفرع">
              {branches.map((branch, index) => (
                <option key={index} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <button className="notification-btn" aria-label="الإشعارات">
            <Bell size={18} />
          </button>

          <div className="divider"></div>

          {/* حالة تسجيل الدخول */}
          {isLoggedIn && employee ? (
            /* في حالة تسجيل الدخول: عرض الحساب الحقيقي */
            <div className="employee-profile-wrapper" ref={profileRef}>
              <button 
                type="button"
                className="profile-trigger-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="avatar-box"><User size={18} /></div>
                <div className="employee-details">
                  <span className="employee-name">{employee.name}</span>
                  <span className="employee-role">{employee.role} | {employee.id}</span>
                </div>
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu">
                  <button type="button" className="dropdown-item" onClick={handleLockClick}>
                    <Lock size={15} color="#333333" />
                    <span>قفل الشاشة</span>
                  </button>
                  <button type="button" className="dropdown-item danger" onClick={handleLogoutClick}>
                    <LogOut size={15} color="#333333" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* تحويل زر تسجيل الدخول إلى Link */
            <Link to={loginPath} className="login-btn">
              <LogIn size={16} />
              <span>تسجيل الدخول</span>
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;