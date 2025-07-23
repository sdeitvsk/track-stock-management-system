
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from './../../assests/logo.svg';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Send, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  ClipboardList,
  Inbox, 
  UserPlus,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const adminItems = [
      { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-400' },
      { name: 'Inventory', href: '/inventory', icon: Package, color: 'text-green-400' },
      { name: 'Transactions', href: '/transactions', icon: Package, color: 'text-purple-400' },
      { name: 'Indent Request', href: '/indent-request', icon: ClipboardList, color: 'text-orange-400' },
      { name: 'Requested Indents', href: '/indent-requests', icon: Inbox, color: 'text-pink-400' },
      { name: 'Members', href: '/members', icon: Users, color: 'text-cyan-400' },
      { name: 'Login Users', href: '/login-users', icon: UserPlus, color: 'text-emerald-400' },
      { name: 'Reports', href: '/reports', icon: FileText, color: 'text-indigo-400' },
      { name: 'Advanced Reports', href: '/advanced-reports', icon: BarChart3, color: 'text-red-400' },
    ];

    const staffItems = [
      { name: 'Indent Request', href: '/indent-request', icon: ClipboardList, color: 'text-orange-400' },
      { name: 'Requested Indents', href: '/indent-requests', icon: Inbox, color: 'text-pink-400' },
    ];

    return isAdmin ? adminItems : staffItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <img src={logo} alt="Logo" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Inventory
            </h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 transform scale-105'
                : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:text-white hover:shadow-lg hover:transform hover:scale-105'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
            <span className="font-medium">{item.name}</span>
            {isActive(item.href) && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-xs text-purple-300 capitalize font-medium">{user?.role}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          {isAdmin && (
            <Link
              to="/settings"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 rounded-lg transition-all duration-200 group"
            >
              <Settings className="w-4 h-4 text-yellow-400 group-hover:rotate-45 transition-transform" />
              <span>Settings</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-pink-600/20 rounded-lg w-full transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
