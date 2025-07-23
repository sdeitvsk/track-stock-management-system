
import React from 'react';
import { Bell, Search } from 'lucide-react';
import logo from './../../assests/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarTrigger } from '../ui/sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-200/50 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
             <img src={logo} alt="Logo" className="w-6 h-6 text-white" />
              {title}
            </h1>
            {subtitle && (
              <p className="text-purple-600/70 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white/70 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm shadow-md"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-3 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse shadow-lg"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3 bg-white/70 rounded-xl p-2 shadow-md backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
              <p className="text-xs text-purple-600 capitalize font-medium">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
