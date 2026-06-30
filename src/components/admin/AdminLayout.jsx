import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UsersRound, Scale, Calendar, 
  FileText, CreditCard, PieChart, Settings, ShieldCheck,
  Search, Bell, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Lawyers', path: '/admin/lawyers', icon: Scale },
  { name: 'Clients', path: '/admin/clients', icon: UsersRound },
  { name: 'Cases', path: '/admin/cases', icon: FileText },
  { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
  { name: 'Documents', path: '/admin/documents', icon: FileText },
  { name: 'Reports', path: '/admin/reports', icon: PieChart },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Lawyer Registration', message: 'Rahul Sharma has registered and is pending verification.', time: '10 mins ago', read: false },
    { id: 2, title: 'Case Update', message: 'Case #1024 has been marked as resolved.', time: '1 hour ago', read: false },
    { id: 3, title: 'New Appointment', message: 'Sneha Gupta booked a consultation.', time: '2 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1E3A8A] text-white transition-all duration-300 z-20">
        <div className="h-16 flex items-center justify-center border-b border-blue-900/50">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-200" />
            <span className="text-xl font-bold tracking-tight">CaseXpert Admin</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-800 text-white shadow-inner' 
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-blue-900/50">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Mobile) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1E3A8A] text-white z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/50">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-200" />
            <span className="text-xl font-bold tracking-tight">CaseXpert</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-blue-800 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-800 text-white shadow-inner' 
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="relative hidden sm:block w-64 md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-[#1E3A8A] dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm">You have no notifications.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.map((n) => (
                            <div key={n.id} className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {n.message}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">
                                  {n.time}
                                </p>
                              </div>
                              <button 
                                onClick={() => removeNotification(n.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all shrink-0 self-start"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Super Admin</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800">
                {user?.profile_image ? (
                   <img src={user.profile_image} alt="Admin" className="h-full w-full rounded-full object-cover" />
                ) : (
                   user?.name?.charAt(0) || 'A'
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN OUTLET (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
